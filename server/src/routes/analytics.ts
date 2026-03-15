import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/analytics/streak
router.get('/streak', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [sessionsRes, userRes] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false }),
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

// GET /api/analytics/summary — total mins, sessions, streak, current phase, weak spots
router.get('/summary', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [sessionsRes, userRes, recentRes] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('date, duration_min')
      .eq('user_id', userId)
      .order('date', { ascending: false }),
    supabase
      .from('users')
      .select('current_phase, timezone, selected_curriculum_key')
      .eq('id', userId)
      .single(),
    supabase
      .from('practice_sessions')
      .select('sections')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo),
  ]);

  if (sessionsRes.error) {
    res.status(500).json({ error: sessionsRes.error.message });
    return;
  }

  const sessions = sessionsRes.data ?? [];
  const timezone = userRes.data?.timezone ?? 'UTC';
  const currentPhase = userRes.data?.current_phase ?? 0;
  const curriculumKey = userRes.data?.selected_curriculum_key ?? 'best_of_all';

  const totalMins = sessions.reduce((sum, s) => sum + s.duration_min, 0);
  const totalSessions = sessions.length;
  const streak = calcStreak(
    sessions.map((s) => s.date),
    timezone,
  );

  // Last 7 days activity for mini chart
  const todayLocal = todayInTz(timezone);
  const last7: { date: string; duration_min: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = offsetDate(todayLocal, -i);
    const dayTotal = sessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration_min, 0);
    last7.push({ date: dateStr, duration_min: dayTotal });
  }

  // Compute weak spots: skills in current phase practiced < 3 times in last 7 days
  const skillPracticeCount = new Map<string, number>();
  for (const session of recentRes.data ?? []) {
    const sects: Array<{ name: string }> = session.sections ?? [];
    for (const s of sects) {
      skillPracticeCount.set(s.name, (skillPracticeCount.get(s.name) ?? 0) + 1);
    }
  }

  // Fetch skills in current phase for this curriculum
  const { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .single();

  let weakSpots: Array<{
    skill_key: string;
    skill_title: string;
    skill_category: string;
    practice_count_last7: number;
  }> = [];

  if (curriculumSource) {
    const { data: phaseSkills } = await supabase
      .from('curriculum_skill_entries')
      .select('skills ( key, title, category )')
      .eq('curriculum_id', curriculumSource.id)
      .eq('phase_number', currentPhase);

    for (const entry of phaseSkills ?? []) {
      const skill = entry.skills as unknown as {
        key: string;
        title: string;
        category: string;
      } | null;
      if (!skill || skill.category === 'warmup') continue;
      const count = skillPracticeCount.get(skill.title) ?? 0;
      if (count < 3) {
        weakSpots.push({
          skill_key: skill.key,
          skill_title: skill.title,
          skill_category: skill.category,
          practice_count_last7: count,
        });
      }
    }
    // Sort: least practiced first, max 5 items
    weakSpots = weakSpots
      .sort((a, b) => a.practice_count_last7 - b.practice_count_last7)
      .slice(0, 5);
  }

  res.json({ totalMins, totalSessions, streak, currentPhase, last7, weakSpots });
});

// ---- helpers ----

function todayInTz(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date()); // en-CA gives YYYY-MM-DD
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
