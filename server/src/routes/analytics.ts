import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/analytics/streak
router.get('/streak', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [sessionsRes, userRes] = await Promise.all([
    supabase.from('practice_sessions').select('date').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('users').select('timezone').eq('id', userId).single(),
  ]);

  if (sessionsRes.error) {
    res.status(500).json({ error: sessionsRes.error.message });
    return;
  }

  const timezone = userRes.data?.timezone ?? 'UTC';
  const streak = calcStreak(sessionsRes.data?.map((r) => r.date) ?? [], timezone);
  res.json({ streak });
});

// GET /api/analytics/summary — total mins, sessions, streak, current phase
router.get('/summary', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [sessionsRes, userRes] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('date, duration_min')
      .eq('user_id', userId)
      .order('date', { ascending: false }),
    supabase
      .from('users')
      .select('current_phase, timezone')
      .eq('id', userId)
      .single(),
  ]);

  if (sessionsRes.error) {
    res.status(500).json({ error: sessionsRes.error.message });
    return;
  }

  const sessions = sessionsRes.data ?? [];
  const timezone = userRes.data?.timezone ?? 'UTC';
  const totalMins = sessions.reduce((sum, s) => sum + s.duration_min, 0);
  const totalSessions = sessions.length;
  const streak = calcStreak(sessions.map((s) => s.date), timezone);
  const currentPhase = userRes.data?.current_phase ?? 0;

  // Last 7 days activity for mini chart (in user's timezone)
  const todayLocal = todayInTz(timezone);
  const last7: { date: string; duration_min: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = offsetDate(todayLocal, -i);
    const dayTotal = sessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration_min, 0);
    last7.push({ date: dateStr, duration_min: dayTotal });
  }

  res.json({ totalMins, totalSessions, streak, currentPhase, last7 });
});

// ---- helpers ----

function todayInTz(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone })
      .format(new Date()); // en-CA gives YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function calcStreak(dates: string[], timezone = 'UTC'): number {
  if (!dates.length) return 0;

  const unique = [...new Set(dates)].sort().reverse(); // newest first
  const today = todayInTz(timezone);
  const yesterday = offsetDate(today, -1);

  // Streak only counts if practiced today or yesterday
  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const expected = offsetDate(unique[i - 1], -1);
    if (unique[i] === expected) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// GET /api/analytics/history?days=90 — daily totals for chart
router.get('/history', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const rawDays = parseInt(req.query.days as string);
  const days = Math.min(isNaN(rawDays) || rawDays < 1 ? 90 : rawDays, 365);

  const from = offsetDate(new Date().toISOString().split('T')[0], -days + 1);

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('date, duration_min')
    .eq('user_id', userId)
    .gte('date', from)
    .order('date', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Build a full day-by-day array (gaps = 0)
  const map: Record<string, number> = {};
  (data ?? []).forEach((r) => {
    map[r.date] = (map[r.date] ?? 0) + r.duration_min;
  });

  const result: { date: string; duration_min: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = offsetDate(from, i);
    result.push({ date: d, duration_min: map[d] ?? 0 });
  }

  res.json(result);
});

export default router;
