import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { completePlanItemSchema, skipPlanSchema } from '../schemas/practice-plan';
import type { DailyPracticePlan, PracticePlanItem } from '@gmh/shared/types/practice-plan';

const router = Router();
router.use(requireAuth);

// ─────────────────────────────────────────────────────────────
// GET /api/practice/plan/today
// Returns existing plan for today, or generates a new one.
// Idempotent: calling multiple times returns the same plan.
// ─────────────────────────────────────────────────────────────
router.get('/today', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Check for an existing plan today
  const { data: existing, error: fetchErr } = await supabase
    .from('daily_practice_plans')
    .select('*, daily_practice_plan_items(*)')
    .eq('user_id', userId)
    .eq('plan_date', today)
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" — expected when no plan yet
    res.status(500).json({ error: 'Failed to fetch practice plan' });
    return;
  }

  if (existing) {
    const items = ((existing.daily_practice_plan_items ?? []) as PracticePlanItem[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    res.json({ ...existing, items } as DailyPracticePlan);
    return;
  }

  // 2. No plan yet — generate one
  const plan = await generatePlan(userId, today);
  if (!plan) {
    // Not enough curriculum data to generate — return empty plan
    res.status(204).end();
    return;
  }

  res.json(plan);
});

// ─────────────────────────────────────────────────────────────
// POST /api/practice/plan/today/items/:itemId/complete
// Mark a specific plan item as done.
// ─────────────────────────────────────────────────────────────
router.post('/today/items/:itemId/complete', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  const parsed = completePlanItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  // Verify item belongs to this user's today plan
  const { data: item, error: itemErr } = await supabase
    .from('daily_practice_plan_items')
    .select('id, plan_id, completed')
    .eq('id', itemId)
    .single();

  if (itemErr || !item) {
    res.status(404).json({ error: 'Plan item not found' });
    return;
  }

  // Verify plan ownership
  const { data: plan, error: planErr } = await supabase
    .from('daily_practice_plans')
    .select('id, status')
    .eq('id', item.plan_id)
    .eq('user_id', userId)
    .eq('plan_date', today)
    .single();

  if (planErr || !plan) {
    res.status(403).json({ error: 'Not authorised to update this plan item' });
    return;
  }

  // Mark item complete
  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from('daily_practice_plan_items')
    .update({
      completed: true,
      completed_at: now,
      actual_duration_min: parsed.data.actual_duration_min ?? null,
      confidence_rating: parsed.data.confidence_rating ?? null,
    })
    .eq('id', itemId);

  if (updateErr) {
    res.status(500).json({ error: 'Failed to complete item' });
    return;
  }

  // Check if all items are now done → mark plan completed
  const { data: remainingItems } = await supabase
    .from('daily_practice_plan_items')
    .select('completed')
    .eq('plan_id', plan.id)
    .eq('completed', false);

  const allDone = (remainingItems?.length ?? 0) === 0;

  if (allDone) {
    await supabase
      .from('daily_practice_plans')
      .update({ status: 'completed', completed_at: now })
      .eq('id', plan.id);
  } else if (plan.status === 'pending') {
    await supabase
      .from('daily_practice_plans')
      .update({ status: 'in_progress', started_at: now })
      .eq('id', plan.id);
  }

  res.json({ success: true, allDone });
});

// ─────────────────────────────────────────────────────────────
// POST /api/practice/plan/today/skip
// Mark today's plan as skipped (user won't follow it today).
// ─────────────────────────────────────────────────────────────
router.post('/today/skip', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const today = new Date().toISOString().slice(0, 10);

  const parsed = skipPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  const { error } = await supabase
    .from('daily_practice_plans')
    .update({ status: 'skipped' })
    .eq('user_id', userId)
    .eq('plan_date', today)
    .in('status', ['pending', 'in_progress']); // only skip if not already completed

  if (error) {
    res.status(500).json({ error: 'Failed to skip plan' });
    return;
  }

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────
// PLAN GENERATION ALGORITHM
// ─────────────────────────────────────────────────────────────
async function generatePlan(userId: string, today: string): Promise<DailyPracticePlan | null> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // 1. Fetch user's profile first so we have curriculum_key for all subsequent queries
  const { data: user } = await supabase
    .from('users')
    .select('current_phase, daily_goal_min, selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const currentPhase: number = user.current_phase ?? 0;
  const dailyGoalMin: number = user.daily_goal_min > 0 ? user.daily_goal_min : 20;
  const curriculumKey: string = user.selected_curriculum_key ?? 'best_of_all';

  // 0. Fetch confidence history — last 14 days of rated items for this curriculum only
  // Step 0a: get plan IDs filtered by curriculum_key so confidence data is curriculum-scoped
  const { data: recentPlans } = await supabase
    .from('daily_practice_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey)
    .gte('plan_date', fourteenDaysAgo);

  const recentPlanIds = (recentPlans ?? []).map((p) => p.id);

  // Step 0b: get rated items from those plans
  const confidenceMap = new Map<string, { sum: number; count: number }>();
  if (recentPlanIds.length > 0) {
    const { data: ratedItems } = await supabase
      .from('daily_practice_plan_items')
      .select('skill_id, confidence_rating')
      .in('plan_id', recentPlanIds)
      .not('confidence_rating', 'is', null);

    for (const item of ratedItems ?? []) {
      if (!item.skill_id || !item.confidence_rating) continue;
      const existing = confidenceMap.get(item.skill_id) ?? { sum: 0, count: 0 };
      confidenceMap.set(item.skill_id, {
        sum: existing.sum + item.confidence_rating,
        count: existing.count + 1,
      });
    }
  }

  // 2. Fetch curriculum source
  const { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  // Fall back to best_of_all if selected curriculum not found
  const { data: resolvedCurriculum } = curriculumSource
    ? { data: curriculumSource }
    : await supabase.from('curriculum_sources').select('id').eq('key', 'best_of_all').single();

  if (!resolvedCurriculum) return null;

  // 3. Fetch all skills in current phase for this curriculum
  const { data: phaseEntries } = await supabase
    .from('curriculum_skill_entries')
    .select(
      `
      sort_order,
      video_youtube_id,
      practice_tip,
      skills ( id, key, category, title )
    `,
    )
    .eq('curriculum_id', resolvedCurriculum.id)
    .eq('phase_number', currentPhase + 1)
    .order('sort_order');

  let entries = phaseEntries ?? [];

  // Edge: no skills in current phase — try next phase down or phase 1
  if (entries.length === 0) {
    // fallbackPhase is phase_number (1-based); currentPhase is 0-based
    const fallbackPhase = currentPhase > 0 ? currentPhase : 1;
    const { data: fallback } = await supabase
      .from('curriculum_skill_entries')
      .select(`sort_order, video_youtube_id, practice_tip, skills ( id, key, category, title )`)
      .eq('curriculum_id', resolvedCurriculum.id)
      .eq('phase_number', fallbackPhase)
      .order('sort_order');
    entries = fallback ?? [];
  }

  if (entries.length === 0) return null;

  // 4. Fetch user's skill_progress for this curriculum to find weak skills
  const { data: progress } = await supabase
    .from('skill_progress')
    .select('phase_index, skill_index, completed')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey);

  // 5. Fetch practice session sections from last 7 days to identify weak skills
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: recentSessions } = await supabase
    .from('practice_sessions')
    .select('sections')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo);

  // Count how many times each skill key appeared in sections over last 7 days
  const skillPracticeCount = new Map<string, number>();
  for (const session of recentSessions ?? []) {
    const sections: Array<{ name: string }> = session.sections ?? [];
    for (const section of sections) {
      const count = skillPracticeCount.get(section.name) ?? 0;
      skillPracticeCount.set(section.name, count + 1);
    }
  }

  // 6. Categorise entries using confidence history (plan algorithm v2)
  // progress data available for future spaced-repetition enhancements
  void progress;

  type Entry = (typeof entries)[0];
  const warmupEntries: Entry[] = [];
  const hardEntries: Entry[] = []; // avg confidence < 1.7 — needs most work
  const newEntries: Entry[] = []; // no confidence data yet — unknown, treat as priority
  const weakEntries: Entry[] = []; // practiced but not mastered
  const consolidationEntries: Entry[] = []; // avg confidence > 2.6 AND 5+ sessions — near mastery
  const songEntries: Entry[] = [];

  for (const entry of entries) {
    const skill = entry.skills as unknown as {
      id: string;
      key: string;
      category: string;
      title: string;
    };
    if (!skill) continue;

    const practiceCount = skillPracticeCount.get(skill.title) ?? 0;
    const conf = confidenceMap.get(skill.id);
    const avgConfidence = conf ? conf.sum / conf.count : null;
    const ratedCount = conf?.count ?? 0;

    if (skill.category === 'warmup') {
      warmupEntries.push(entry);
    } else if (skill.category === 'song') {
      songEntries.push(entry);
    } else if (avgConfidence !== null && avgConfidence > 2.6 && ratedCount >= 5) {
      // Near mastery — still include but lowest priority
      consolidationEntries.push(entry);
    } else if (avgConfidence !== null && avgConfidence < 1.7) {
      // Hard zone — highest priority
      hardEntries.push(entry);
    } else if (conf === undefined && practiceCount < 3) {
      // No confidence data yet + not recently practiced → unknown, prioritise
      newEntries.push(entry);
    } else {
      // In-progress skills
      weakEntries.push(entry);
    }
  }

  // 7. Build item list with time allocation
  // Warmup: 20% (max 5 min), New/weak skill: 50%, Second skill: 20%, Song: 10%
  const planItems: Array<{
    skill_id: string;
    skill_title: string;
    skill_category: string;
    duration_min: number;
    sort_order: number;
    video_youtube_id: string | null;
    practice_tip: string | null;
  }> = [];

  let remaining = dailyGoalMin;
  let order = 0;

  // Warmup
  if (warmupEntries.length > 0) {
    const warmup = warmupEntries[0];
    const warmupSkill = warmup.skills as unknown as { id: string; title: string; category: string };
    const warmupMin = Math.min(5, Math.round(remaining * 0.2));
    planItems.push({
      skill_id: warmupSkill.id,
      skill_title: warmupSkill.title,
      skill_category: warmupSkill.category,
      duration_min: Math.max(1, warmupMin),
      sort_order: order++,
      video_youtube_id: warmup.video_youtube_id,
      practice_tip: warmup.practice_tip,
    });
    remaining -= warmupMin;
  }

  // v3: sort hardEntries by avg_confidence ascending so the weakest skill is always pool[0]
  hardEntries.sort((a, b) => {
    const skillA = (a.skills as unknown as { id: string } | null)?.id;
    const skillB = (b.skills as unknown as { id: string } | null)?.id;
    const confA = skillA
      ? (confidenceMap.get(skillA)?.sum ?? 0) / (confidenceMap.get(skillA)?.count ?? 1)
      : 1.0;
    const confB = skillB
      ? (confidenceMap.get(skillB)?.sum ?? 0) / (confidenceMap.get(skillB)?.count ?? 1)
      : 1.0;
    return confA - confB;
  });

  // Primary focus: hard skills first, then new (unrated), then weak, then consolidation
  const primaryPool = [...hardEntries, ...newEntries, ...weakEntries, ...consolidationEntries];
  if (primaryPool.length > 0 && remaining > 0) {
    const primary = primaryPool[0];
    const primarySkill = primary.skills as unknown as {
      id: string;
      title: string;
      category: string;
    };
    const primaryMin = Math.round(remaining * 0.55);
    planItems.push({
      skill_id: primarySkill.id,
      skill_title: primarySkill.title,
      skill_category: primarySkill.category,
      duration_min: Math.max(3, primaryMin),
      sort_order: order++,
      video_youtube_id: primary.video_youtube_id,
      practice_tip: primary.practice_tip,
    });
    remaining -= primaryMin;
  }

  // Secondary: second skill from pool if time allows
  if (primaryPool.length > 1 && remaining >= 5) {
    const secondary = primaryPool[1];
    const secondarySkill = secondary.skills as unknown as {
      id: string;
      title: string;
      category: string;
    };
    const secondaryMin = Math.round(remaining * 0.6);
    planItems.push({
      skill_id: secondarySkill.id,
      skill_title: secondarySkill.title,
      skill_category: secondarySkill.category,
      duration_min: Math.max(3, secondaryMin),
      sort_order: order++,
      video_youtube_id: secondary.video_youtube_id,
      practice_tip: secondary.practice_tip,
    });
    remaining -= secondaryMin;
  }

  // Song: last slot if time remains
  if (songEntries.length > 0 && remaining >= 3) {
    const song = songEntries[0];
    const songSkill = song.skills as unknown as { id: string; title: string; category: string };
    planItems.push({
      skill_id: songSkill.id,
      skill_title: songSkill.title,
      skill_category: songSkill.category,
      duration_min: Math.max(3, remaining),
      sort_order: order,
      video_youtube_id: song.video_youtube_id,
      practice_tip: song.practice_tip,
    });
  }

  if (planItems.length === 0) return null;

  const totalMin = planItems.reduce((sum, i) => sum + i.duration_min, 0);

  // 8. Persist plan
  const { data: newPlan, error: planErr } = await supabase
    .from('daily_practice_plans')
    .insert({
      user_id: userId,
      plan_date: today,
      curriculum_key: curriculumKey,
      total_duration_min: totalMin,
      status: 'pending',
    })
    .select()
    .single();

  if (planErr || !newPlan) return null;

  // 9. Persist items
  const { data: newItems, error: itemsErr } = await supabase
    .from('daily_practice_plan_items')
    .insert(planItems.map((item) => ({ ...item, plan_id: newPlan.id })))
    .select();

  if (itemsErr) {
    // Clean up orphan plan
    await supabase.from('daily_practice_plans').delete().eq('id', newPlan.id);
    return null;
  }

  const items = ((newItems ?? []) as PracticePlanItem[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return { ...newPlan, items } as DailyPracticePlan;
}

export default router;
