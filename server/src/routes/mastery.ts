import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type {
  MasteryNode,
  MasteryState,
  MasteryMapResponse,
  PhaseNodes,
  RustyCheckResponse,
} from '@gmh/shared/types';
import type { ConfidenceRating } from '@gmh/shared/types/practice-plan';

const router = Router();
router.use(requireAuth);

const RUSTY_DAYS = 21;

// GET /api/mastery/map — full skill mastery map for the user's active curriculum
router.get('/map', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // 1. User's selected curriculum
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (userErr) {
    res.status(500).json({ error: userErr.message });
    return;
  }

  const curriculumKey: string =
    (user as { selected_curriculum_key?: string } | null)?.selected_curriculum_key ?? 'best_of_all';

  // 2. Curriculum source id
  const { data: source } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (!source) {
    res.json({ phases: [], rusty_count: 0 } satisfies MasteryMapResponse);
    return;
  }

  // 3. All skill entries for this curriculum (ordered: phase_number → sort_order)
  const { data: entries, error: entriesErr } = await supabase
    .from('curriculum_skill_entries')
    .select(
      `skill_id, phase_number, phase_title, sort_order, video_youtube_id, practice_tip,
       skills ( key, title )`,
    )
    .eq('curriculum_id', (source as { id: string }).id)
    .order('phase_number', { ascending: true })
    .order('sort_order', { ascending: true });

  if (entriesErr) {
    res.status(500).json({ error: entriesErr.message });
    return;
  }

  // 4. All skill_progress rows for this user + curriculum
  const { data: progress } = await supabase
    .from('skill_progress')
    .select('phase_index, skill_index, completed, completed_at, last_practiced_at, mastery_state')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey);

  // 5. Recent practice plan items for confidence history (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: recentPlans } = await supabase
    .from('daily_practice_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey)
    .gte('plan_date', ninetyDaysAgo)
    .order('plan_date', { ascending: false })
    .limit(60);

  // Build skill_id → last-5-confidence-ratings map
  const confidenceMap = new Map<string, ConfidenceRating[]>();
  const planIds = (recentPlans ?? []).map((p) => (p as { id: string }).id);
  if (planIds.length > 0) {
    const { data: planItems } = await supabase
      .from('daily_practice_plan_items')
      .select('skill_id, confidence_rating')
      .in('plan_id', planIds)
      .not('confidence_rating', 'is', null);

    for (const item of planItems ?? []) {
      const it = item as { skill_id?: string; confidence_rating?: number };
      if (it.skill_id && it.confidence_rating != null) {
        const hist = confidenceMap.get(it.skill_id) ?? [];
        if (hist.length < 5) hist.push(it.confidence_rating as ConfidenceRating);
        confidenceMap.set(it.skill_id, hist);
      }
    }
  }

  // 6. Build phase map (phase_number → 0-based phase_index)
  const phaseMap = new Map<number, PhaseNodes>();
  const phaseOrder: number[] = [];
  const skillIndexPerPhase = new Map<number, number>();
  let rustyCount = 0;

  for (const entry of entries ?? []) {
    const phaseNum: number = (entry as { phase_number: number }).phase_number;
    const phaseTitle: string = (entry as { phase_title: string }).phase_title;
    const phaseIdx = phaseNum - 1; // 0-based

    if (!phaseMap.has(phaseNum)) {
      phaseMap.set(phaseNum, { phase_index: phaseIdx, phase_title: phaseTitle, nodes: [] });
      phaseOrder.push(phaseNum);
      skillIndexPerPhase.set(phaseNum, 0);
    }

    const si = skillIndexPerPhase.get(phaseNum)!;
    skillIndexPerPhase.set(phaseNum, si + 1);

    const progressRow = (progress ?? []).find(
      (p) => p.phase_index === phaseIdx && p.skill_index === si,
    );

    // Compute mastery_state dynamically
    let masteryState: MasteryState = 'not_started';
    if (progressRow) {
      if (!progressRow.completed) {
        masteryState = 'learning';
      } else {
        const practiced = progressRow.last_practiced_at ?? progressRow.completed_at;
        if (practiced) {
          const daysSince = (Date.now() - new Date(practiced).getTime()) / (1000 * 60 * 60 * 24);
          masteryState = daysSince <= RUSTY_DAYS ? 'mastered' : 'rusty';
        } else {
          masteryState = 'mastered';
        }
      }
    }

    if (masteryState === 'rusty') rustyCount++;

    const skillArr = (entry as { skills: { key: string; title: string }[] }).skills;
    const skill = Array.isArray(skillArr)
      ? (skillArr[0] ?? null)
      : (skillArr as unknown as { key: string; title: string } | null);
    const skillId: string = (entry as { skill_id: string }).skill_id;

    const node: MasteryNode = {
      skill_key: skill?.key ?? '',
      title: skill?.title ?? `Skill ${si + 1}`,
      phase_index: phaseIdx,
      skill_index: si,
      mastery_state: masteryState,
      last_practiced_at: progressRow?.last_practiced_at ?? null,
      confidence_history: confidenceMap.get(skillId) ?? [],
      youtube_id: (entry as { video_youtube_id?: string | null }).video_youtube_id ?? null,
      practice_tip: (entry as { practice_tip?: string | null }).practice_tip ?? null,
    };

    phaseMap.get(phaseNum)!.nodes.push(node);
  }

  const phases = phaseOrder.map((pn) => phaseMap.get(pn)!);

  res.json({ phases, rusty_count: rustyCount } satisfies MasteryMapResponse);
});

// POST /api/mastery/rusty-check — batch-mark mastered skills as rusty if > 21 days since practiced
router.post('/rusty-check', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const { data: user } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();

  const curriculumKey: string =
    (user as { selected_curriculum_key?: string } | null)?.selected_curriculum_key ?? 'best_of_all';

  const cutoff = new Date(Date.now() - RUSTY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Find mastered skills whose last_practiced_at is beyond the cutoff
  const { data: rustyRows, error: rustyErr } = await supabase
    .from('skill_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey)
    .eq('completed', true)
    .eq('mastery_state', 'mastered')
    .lt('last_practiced_at', cutoff);

  if (rustyErr) {
    res.status(500).json({ error: rustyErr.message });
    return;
  }

  const ids = (rustyRows ?? []).map((r) => r.id as string);
  let updatedCount = 0;

  if (ids.length > 0) {
    await supabase.from('skill_progress').update({ mastery_state: 'rusty' }).in('id', ids);

    updatedCount = ids.length;
  }

  res.json({ updated_count: updatedCount } satisfies RustyCheckResponse);
});

export default router;
