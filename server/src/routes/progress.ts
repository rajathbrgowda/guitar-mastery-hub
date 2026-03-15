import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { toggleSkillSchema, setPhaseSchema } from '../schemas/progress';

const router = Router();
router.use(requireAuth);

// GET /api/progress — all skill completions + current_phase for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [skillsRes, userRes] = await Promise.all([
    supabase
      .from('skill_progress')
      .select('id, phase_index, skill_index, completed, completed_at')
      .eq('user_id', userId),
    supabase.from('users').select('current_phase').eq('id', userId).single(),
  ]);

  if (skillsRes.error) {
    res.status(500).json({ error: skillsRes.error.message });
    return;
  }

  res.json({
    skills: skillsRes.data ?? [],
    currentPhase: userRes.data?.current_phase ?? 0,
  });
});

// PATCH /api/progress/skill — toggle a skill (upsert by phase_index + skill_index)
router.patch('/skill', async (req: AuthRequest, res) => {
  const parsed = toggleSkillSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const { phase_index, skill_index, completed } = parsed.data;

  const { data, error } = await supabase
    .from('skill_progress')
    .upsert(
      {
        user_id: userId,
        phase_index,
        skill_index,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,phase_index,skill_index' },
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
router.patch('/phase', async (req: AuthRequest, res) => {
  const parsed = setPhaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({ current_phase: parsed.data.current_phase, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ current_phase: parsed.data.current_phase });
});

export default router;
