import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { logSessionSchema } from '../schemas/practice';
import type { PracticeWeekDay } from '@gmh/shared/types';

const router = Router();
router.use(requireAuth);

// GET /api/practice/week — Mon–Sun activity strip for current week in user's timezone
router.get('/week', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const { data: userData } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', userId)
    .single();

  const tz = (userData as { timezone?: string } | null)?.timezone ?? 'UTC';

  // Current date in user's timezone
  const localDateStr = new Date().toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
  const todayLocal = new Date(localDateStr + 'T12:00:00');
  const dow = todayLocal.getDay(); // 0=Sun
  const daysSinceMon = (dow + 6) % 7;

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayLocal);
    d.setDate(todayLocal.getDate() - daysSinceMon + i);
    days.push(d.toISOString().split('T')[0]);
  }

  const { data: sessions, error } = await supabase
    .from('practice_sessions')
    .select('date, duration_min')
    .eq('user_id', userId)
    .gte('date', days[0])
    .lte('date', days[6]);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result: PracticeWeekDay[] = days.map((date, i) => {
    const daySessions = (sessions ?? []).filter((s) => s.date === date);
    return {
      date,
      day_label: DAY_LABELS[i],
      has_session: daySessions.length > 0,
      duration_min: daySessions.reduce((sum, s) => sum + s.duration_min, 0),
    };
  });

  res.json(result);
});

// GET /api/practice?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { from, to } = req.query;

  let query = supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (typeof from === 'string') query = query.gte('date', from);
  if (typeof to === 'string') query = query.lte('date', to);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /api/practice
router.post('/', async (req: AuthRequest, res) => {
  const parsed = logSessionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { date, duration_min, sections, notes, confidence } = parsed.data;

  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: req.user!.id,
      date,
      duration_min,
      sections: sections ?? null,
      notes: notes ?? null,
      confidence: confidence ?? null,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

export default router;
