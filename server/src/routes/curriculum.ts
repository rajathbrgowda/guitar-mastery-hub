import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type {
  CurriculumSource,
  CurriculumDetail,
  CurriculumPhase,
  CurriculumSkillEntry,
} from '@gmh/shared/types/curriculum';

const router = Router();

// All curriculum routes require authentication (no PII exposed, but keeps API consistent)
router.use(requireAuth);

// GET /api/curriculum — list all active curricula with phase + skill counts
router.get('/', async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('curriculum_sources')
    .select('id, key, name, author, description, style, website_url, is_default, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    res.status(500).json({ error: 'Failed to fetch curricula' });
    return;
  }

  // Fetch phase + skill counts for all curricula in one query
  const { data: entries } = await supabase
    .from('curriculum_skill_entries')
    .select('curriculum_id, phase_number');

  // Compute counts per curriculum
  const countMap = new Map<string, { phase_count: number; skill_count: number }>();
  for (const entry of entries ?? []) {
    const id = entry.curriculum_id as string;
    if (!countMap.has(id)) countMap.set(id, { phase_count: 0, skill_count: 0 });
    const c = countMap.get(id)!;
    c.skill_count++;
  }
  // Phase count = distinct phase_number per curriculum
  const phaseSetMap = new Map<string, Set<number>>();
  for (const entry of entries ?? []) {
    const id = entry.curriculum_id as string;
    if (!phaseSetMap.has(id)) phaseSetMap.set(id, new Set());
    phaseSetMap.get(id)!.add(entry.phase_number as number);
  }
  for (const [id, phases] of phaseSetMap) {
    const c = countMap.get(id);
    if (c) c.phase_count = phases.size;
  }

  const result: CurriculumSource[] = (data ?? []).map((row) => {
    const counts = countMap.get(row.id as string);
    return {
      ...(row as CurriculumSource),
      phase_count: counts?.phase_count ?? 0,
      skill_count: counts?.skill_count ?? 0,
    };
  });

  res.json(result);
});

// GET /api/curriculum/:key — full curriculum with all phases + skills
router.get('/:key', async (req: AuthRequest, res: Response) => {
  const { key } = req.params;

  // Fetch curriculum source
  const { data: source, error: sourceErr } = await supabase
    .from('curriculum_sources')
    .select('id, key, name, author, description, style, website_url, is_default, sort_order')
    .eq('key', key)
    .eq('is_active', true)
    .single();

  if (sourceErr || !source) {
    res.status(404).json({ error: 'Curriculum not found' });
    return;
  }

  // Fetch all skill entries for this curriculum, joined with canonical skill data
  const { data: entries, error: entriesErr } = await supabase
    .from('curriculum_skill_entries')
    .select(
      `
      phase_number,
      phase_title,
      sort_order,
      video_youtube_id,
      video_title,
      practice_tip,
      common_mistake,
      practice_exercise,
      skills (
        id,
        key,
        category,
        title,
        description,
        difficulty,
        chord_diagram_key
      )
    `,
    )
    .eq('curriculum_id', source.id)
    .order('phase_number')
    .order('sort_order');

  if (entriesErr) {
    res.status(500).json({ error: 'Failed to fetch curriculum skills' });
    return;
  }

  // Group by phase
  const phaseMap = new Map<number, CurriculumPhase>();
  for (const entry of entries ?? []) {
    const skill = entry.skills as unknown as CurriculumSkillEntry;
    if (!skill) continue;

    const enrichedSkill: CurriculumSkillEntry = {
      ...skill,
      phase_number: entry.phase_number,
      phase_title: entry.phase_title,
      sort_order: entry.sort_order,
      video_youtube_id: entry.video_youtube_id,
      video_title: entry.video_title,
      practice_tip: entry.practice_tip,
      common_mistake: entry.common_mistake,
      practice_exercise: entry.practice_exercise,
    };

    if (!phaseMap.has(entry.phase_number)) {
      phaseMap.set(entry.phase_number, {
        phase_number: entry.phase_number,
        phase_title: entry.phase_title,
        skills: [],
      });
    }
    phaseMap.get(entry.phase_number)!.skills.push(enrichedSkill);
  }

  const phases = Array.from(phaseMap.values()).sort((a, b) => a.phase_number - b.phase_number);

  const detail: CurriculumDetail = {
    ...(source as CurriculumSource),
    phases,
  };

  res.json(detail);
});

export default router;
