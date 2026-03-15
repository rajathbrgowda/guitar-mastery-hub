import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/roadmap — all phases + skills for user's active curriculum
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // 1. Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('current_phase, selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const curriculumKey: string = user.selected_curriculum_key ?? 'best_of_all';
  const currentPhase: number = user.current_phase ?? 1;

  // 2. Get curriculum source
  const { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (!curriculumSource) {
    res.status(404).json({ error: 'Curriculum not found' });
    return;
  }

  // 3. Get all curriculum skill entries with skill details
  const { data: entries, error } = await supabase
    .from('curriculum_skill_entries')
    .select('phase_number, practice_tip, video_youtube_id, skills ( id, key, title, category )')
    .eq('curriculum_id', curriculumSource.id)
    .order('phase_number', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // 4. Get user's skill progress for this curriculum
  const { data: progressRows } = await supabase
    .from('skill_progress')
    .select('skill_id, completed, confidence')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey);

  const progressMap = new Map<string, { completed: boolean; confidence: number | null }>();
  for (const row of progressRows ?? []) {
    progressMap.set(row.skill_id as string, {
      completed: row.completed as boolean,
      confidence: (row.confidence as number | null) ?? null,
    });
  }

  // 5. Get last_practiced_at per skill title from practice_sessions
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('sections, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(90);

  const lastPracticedMap = new Map<string, string>();
  // sessions.sections is JSONB array of {name, duration_min}
  // Match by skill title since that is what sections stores
  for (const session of sessions ?? []) {
    const sects = (session.sections as Array<{ name: string }>) ?? [];
    for (const s of sects) {
      if (!lastPracticedMap.has(s.name)) {
        lastPracticedMap.set(s.name, session.date as string);
      }
    }
  }

  // 6. Build RoadmapPhase array
  type EntryRow = {
    phase_number: number;
    practice_tip: string | null;
    video_youtube_id: string | null;
    skills: { id: string; key: string; title: string; category: string } | null;
  };

  type PhaseAccumulator = {
    phase_number: number;
    skills: Array<{
      skill_id: string;
      skill_key: string;
      skill_title: string;
      skill_category: string;
      practice_tip: string | null;
      video_youtube_id: string | null;
      completed: boolean;
      confidence: number | null;
      last_practiced_at: string | null;
    }>;
    total_skills: number;
    completed_skills: number;
    completion_pct: number;
  };

  const phases: PhaseAccumulator[] = [];
  const phaseNumbersSeen = new Set<number>();

  for (const entry of (entries ?? []) as unknown as EntryRow[]) {
    const skill = entry.skills;
    if (!skill) continue;

    const phaseNum = entry.phase_number;
    if (!phaseNumbersSeen.has(phaseNum)) {
      phaseNumbersSeen.add(phaseNum);
      phases.push({
        phase_number: phaseNum,
        skills: [],
        total_skills: 0,
        completed_skills: 0,
        completion_pct: 0,
      });
    }

    const phase = phases.find((p) => p.phase_number === phaseNum)!;
    const progress = progressMap.get(skill.id);
    const completed = progress?.completed ?? false;
    const confidence = progress?.confidence ?? null;

    phase.skills.push({
      skill_id: skill.id,
      skill_key: skill.key,
      skill_title: skill.title,
      skill_category: skill.category,
      practice_tip: entry.practice_tip,
      video_youtube_id: entry.video_youtube_id,
      completed,
      confidence,
      last_practiced_at: lastPracticedMap.get(skill.title) ?? null,
    });

    phase.total_skills++;
    if (completed) phase.completed_skills++;
  }

  // Compute completion_pct for each phase
  for (const phase of phases) {
    phase.completion_pct =
      phase.total_skills > 0 ? Math.round((phase.completed_skills / phase.total_skills) * 100) : 0;
  }

  res.json({
    phases,
    current_phase: currentPhase,
    curriculum_key: curriculumKey,
  });
});

const confidenceSchema = z.object({
  confidence: z.number().int().min(1).max(3),
});

// PATCH /api/roadmap/skill/:key/confidence
router.patch('/skill/:key/confidence', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const skillKey = req.params.key;

  const parsed = confidenceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Get user curriculum
  const { data: user } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();
  const curriculumKey: string = user?.selected_curriculum_key ?? 'best_of_all';

  // Look up skill_id by key
  const { data: skill } = await supabase.from('skills').select('id').eq('key', skillKey).single();

  if (!skill) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }

  // Update confidence on existing row, or return 404 if no row exists
  const { data: existing } = await supabase
    .from('skill_progress')
    .select('id, phase_index, skill_index')
    .eq('user_id', userId)
    .eq('skill_id', skill.id)
    .eq('curriculum_key', curriculumKey)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('skill_progress')
      .update({ confidence: parsed.data.confidence })
      .eq('id', existing.id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
  } else {
    // Row doesn't exist yet — user must complete skill first
    res.status(404).json({ error: 'Complete this skill first before rating confidence' });
    return;
  }

  res.json({ success: true });
});

export default router;
