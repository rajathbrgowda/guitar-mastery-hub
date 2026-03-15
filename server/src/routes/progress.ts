import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { toggleSkillSchema, setPhaseSchema } from '../schemas/progress';

const router = Router();
router.use(requireAuth);

// GET /api/progress — all skill completions + current_phase for the logged-in user
// Scoped to the user's currently selected curriculum_key.
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Fetch the user's current phase and selected curriculum in one query
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('current_phase, selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (userErr) {
    res.status(500).json({ error: userErr.message });
    return;
  }

  const curriculumKey: string = user?.selected_curriculum_key ?? 'best_of_all';

  const { data: skills, error: skillsError } = await supabase
    .from('skill_progress')
    .select('id, phase_index, skill_index, completed, completed_at')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey);

  if (skillsError) {
    res.status(500).json({ error: skillsError.message });
    return;
  }

  res.json({
    skills: skills ?? [],
    currentPhase: user?.current_phase ?? 0,
  });
});

// PATCH /api/progress/skill — toggle a skill (upsert by curriculum_key + phase_index + skill_index)
router.patch('/skill', async (req: AuthRequest, res) => {
  const parsed = toggleSkillSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const { phase_index, skill_index, completed } = parsed.data;

  // Fetch the user's selected curriculum
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (userErr) {
    res.status(500).json({ error: userErr.message });
    return;
  }

  const curriculumKey: string = user?.selected_curriculum_key ?? 'best_of_all';

  const { data, error } = await supabase
    .from('skill_progress')
    .upsert(
      {
        user_id: userId,
        curriculum_key: curriculumKey,
        phase_index,
        skill_index,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,curriculum_key,phase_index,skill_index' },
    )
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// PATCH /api/progress/phase — update current phase
// Validates the new phase does not exceed the max phase in the user's curriculum.
router.patch('/phase', async (req: AuthRequest, res) => {
  const parsed = setPhaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const newPhase: number = parsed.data.current_phase;

  // Fetch the user's selected curriculum to validate phase bounds
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (userErr) {
    res.status(500).json({ error: userErr.message });
    return;
  }

  const curriculumKey: string = user?.selected_curriculum_key ?? 'best_of_all';

  // Resolve the curriculum source id
  const { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (curriculumSource) {
    // Fetch the maximum phase_number for this curriculum
    const { data: maxPhaseRow } = await supabase
      .from('curriculum_skill_entries')
      .select('phase_number')
      .eq('curriculum_id', curriculumSource.id)
      .order('phase_number', { ascending: false })
      .limit(1)
      .single();

    const maxPhase: number = maxPhaseRow?.phase_number ?? 5;
    if (newPhase > maxPhase) {
      res
        .status(400)
        .json({ error: `Phase ${newPhase} does not exist in this curriculum (max: ${maxPhase})` });
      return;
    }
  }

  const { error } = await supabase
    .from('users')
    .update({ current_phase: newPhase, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ current_phase: newPhase });
});

export default router;
