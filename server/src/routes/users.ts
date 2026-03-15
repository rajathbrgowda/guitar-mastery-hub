import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { updateProfileSchema, onboardingSchema } from '../schemas/user';
import { switchCurriculumSchema } from '../schemas/curriculum';

const router = Router();
router.use(requireAuth);

const USER_FIELDS =
  'id, email, display_name, guitar_type, years_playing, daily_goal_min, practice_days_target, timezone, avatar_url, current_phase, theme_color, selected_curriculum_key, onboarding_completed, created_at';

// GET /api/users/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('users')
    .select(USER_FIELDS)
    .eq('id', req.user!.id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// PATCH /api/users/me
router.patch('/me', async (req: AuthRequest, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id)
    .select(USER_FIELDS)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// PUT /api/users/me/curriculum — switch curriculum
router.put('/me/curriculum', async (req: AuthRequest, res: Response) => {
  const parsed = switchCurriculumSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  // Verify curriculum exists and is active
  const { data: curriculum, error: currErr } = await supabase
    .from('curriculum_sources')
    .select('key')
    .eq('key', parsed.data.curriculum_key)
    .eq('is_active', true)
    .single();

  if (currErr || !curriculum) {
    res.status(422).json({ error: 'Unknown or inactive curriculum key' });
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      selected_curriculum_key: parsed.data.curriculum_key,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.user!.id)
    .select(USER_FIELDS)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Delete today's plan so it regenerates with the new curriculum's skills
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from('daily_practice_plans')
    .delete()
    .eq('user_id', req.user!.id)
    .eq('plan_date', today);

  res.json(data);
});

// POST /api/users/me/onboard — complete onboarding wizard
// Maps experience_level → current_phase: beginner=0, some=1, intermediate=2
router.post('/me/onboard', async (req: AuthRequest, res: Response) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const PHASE_MAP: Record<string, number> = { beginner: 0, some: 1, intermediate: 2 };
  const current_phase = PHASE_MAP[parsed.data.experience_level];

  // Verify curriculum exists and is active
  const { data: curriculum, error: currErr } = await supabase
    .from('curriculum_sources')
    .select('key')
    .eq('key', parsed.data.curriculum_key)
    .eq('is_active', true)
    .single();

  if (currErr || !curriculum) {
    res.status(400).json({ error: 'Unknown or inactive curriculum key' });
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      current_phase,
      selected_curriculum_key: parsed.data.curriculum_key,
      daily_goal_min: parsed.data.daily_goal_min,
      practice_days_target: parsed.data.practice_days_target,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.user!.id)
    .select(USER_FIELDS)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// GET /api/users/me/export — practice sessions as CSV
router.get('/me/export', async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('date, duration_min, notes, sections, created_at')
    .eq('user_id', req.user!.id)
    .order('date', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const rows = data ?? [];
  const lines: string[] = ['date,duration_min,notes,sections,created_at'];

  for (const row of rows) {
    const sectionsStr = row.sections ? JSON.stringify(row.sections).replace(/"/g, '""') : '';
    const notes = (row.notes ?? '').replace(/"/g, '""');
    lines.push(`${row.date},${row.duration_min},"${notes}","${sectionsStr}",${row.created_at}`);
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="practice-sessions.csv"');
  res.send(lines.join('\n'));
});

// DELETE /api/users/me/progress — wipe all skill progress
router.delete('/me/progress', async (req: AuthRequest, res) => {
  const { error } = await supabase.from('skill_progress').delete().eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  await supabase
    .from('users')
    .update({ current_phase: 0, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id);

  res.json({ message: 'Progress reset.' });
});

export default router;
