import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/users/me
router.get('/me', async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// PATCH /api/users/me
const updateProfileSchema = z.object({
  display_name:          z.string().min(1).max(50).nullable().optional(),
  guitar_type:           z.enum(['acoustic', 'electric', 'classical', 'bass', 'other']).optional(),
  years_playing:         z.number().int().min(0).max(60).optional(),
  daily_goal_min:        z.number().int().min(5).max(480).optional(),
  practice_days_target:  z.number().int().min(1).max(7).optional(),
  timezone:              z.string().max(50).optional(),
  avatar_url:            z.string().url().nullable().optional(),
  theme_color:           z.enum(['helix', 'ocean', 'forest', 'violet', 'rose']).optional(),
});

router.patch('/me', async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id)
    .select('id, email, display_name, guitar_type, years_playing, daily_goal_min, practice_days_target, timezone, avatar_url, current_phase, theme_color, created_at')
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
    const sectionsStr = row.sections
      ? JSON.stringify(row.sections).replace(/"/g, '""')
      : '';
    const notes = (row.notes ?? '').replace(/"/g, '""');
    lines.push(`${row.date},${row.duration_min},"${notes}","${sectionsStr}",${row.created_at}`);
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="practice-sessions.csv"');
  res.send(lines.join('\n'));
});

// DELETE /api/users/me/progress — wipe all skill progress
router.delete('/me/progress', async (req: AuthRequest, res) => {
  const { error } = await supabase
    .from('skill_progress')
    .delete()
    .eq('user_id', req.user!.id);

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
