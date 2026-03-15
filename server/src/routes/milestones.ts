import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import type { Milestone } from '@gmh/shared/types/milestones';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // 3 parallel queries
  const [sessionsRes, plansRes, userRes] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('date, duration_min')
      .eq('user_id', userId)
      .order('date', { ascending: true }),
    supabase
      .from('daily_practice_plans')
      .select('plan_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('plan_date', { ascending: true }),
    supabase.from('users').select('timezone').eq('id', userId).single(),
  ]);

  if (sessionsRes.error) {
    res.status(500).json({ error: sessionsRes.error.message });
    return;
  }

  const sessions = sessionsRes.data ?? [];
  const completedPlans = plansRes.data ?? [];
  const timezone = userRes.data?.timezone ?? 'UTC';

  const sessionCount = sessions.length;
  const totalMins = sessions.reduce((s, r) => s + r.duration_min, 0);
  const streak = calcStreak(
    sessions.map((s) => s.date),
    timezone,
  );
  const planCount = completedPlans.length;

  // earned_at helpers
  function sessionEarnedAt(n: number): string | null {
    return sessions[n - 1]?.date ?? null;
  }
  function minsEarnedAt(threshold: number): string | null {
    let acc = 0;
    for (const s of sessions) {
      acc += s.duration_min;
      if (acc >= threshold) return s.date;
    }
    return null;
  }
  function planEarnedAt(n: number): string | null {
    return completedPlans[n - 1]?.plan_date ?? null;
  }

  const MILESTONES: Milestone[] = [
    {
      key: 'first_session',
      title: 'First Note',
      description: 'Log your very first practice session.',
      category: 'sessions',
      earned: sessionCount >= 1,
      earned_at: sessionCount >= 1 ? sessionEarnedAt(1) : null,
    },
    {
      key: 'sessions_5',
      title: 'Getting Started',
      description: 'Complete 5 practice sessions.',
      category: 'sessions',
      earned: sessionCount >= 5,
      earned_at: sessionCount >= 5 ? sessionEarnedAt(5) : null,
    },
    {
      key: 'sessions_25',
      title: 'Building Habit',
      description: 'Complete 25 practice sessions.',
      category: 'sessions',
      earned: sessionCount >= 25,
      earned_at: sessionCount >= 25 ? sessionEarnedAt(25) : null,
    },
    {
      key: 'sessions_100',
      title: 'Century Mark',
      description: 'Complete 100 practice sessions.',
      category: 'sessions',
      earned: sessionCount >= 100,
      earned_at: sessionCount >= 100 ? sessionEarnedAt(100) : null,
    },
    {
      key: 'streak_3',
      title: 'On a Roll',
      description: 'Practice 3 days in a row.',
      category: 'streak',
      earned: streak >= 3,
      earned_at: null,
    },
    {
      key: 'streak_7',
      title: 'Week Warrior',
      description: 'Practice 7 days in a row.',
      category: 'streak',
      earned: streak >= 7,
      earned_at: null,
    },
    {
      key: 'streak_30',
      title: 'Monthly Grind',
      description: 'Practice 30 days in a row.',
      category: 'streak',
      earned: streak >= 30,
      earned_at: null,
    },
    {
      key: 'mins_60',
      title: 'First Hour',
      description: 'Accumulate 60 minutes of total practice.',
      category: 'time',
      earned: totalMins >= 60,
      earned_at: totalMins >= 60 ? minsEarnedAt(60) : null,
    },
    {
      key: 'mins_300',
      title: 'Five Hours In',
      description: 'Accumulate 5 hours (300 min) of total practice.',
      category: 'time',
      earned: totalMins >= 300,
      earned_at: totalMins >= 300 ? minsEarnedAt(300) : null,
    },
    {
      key: 'mins_1000',
      title: 'Four Figures',
      description: 'Accumulate 1,000 minutes of total practice.',
      category: 'time',
      earned: totalMins >= 1000,
      earned_at: totalMins >= 1000 ? minsEarnedAt(1000) : null,
    },
    {
      key: 'first_plan',
      title: 'Plan Completer',
      description: 'Complete your first daily practice plan.',
      category: 'plans',
      earned: planCount >= 1,
      earned_at: planCount >= 1 ? planEarnedAt(1) : null,
    },
    {
      key: 'plans_10',
      title: 'Dedicated Practicer',
      description: 'Complete 10 daily practice plans.',
      category: 'plans',
      earned: planCount >= 10,
      earned_at: planCount >= 10 ? planEarnedAt(10) : null,
    },
  ];

  const earnedCount = MILESTONES.filter((m) => m.earned).length;

  res.json({
    milestones: MILESTONES,
    earned_count: earnedCount,
    total_count: MILESTONES.length,
  });
});

function todayInTz(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function calcStreak(dates: string[], timezone = 'UTC'): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = todayInTz(timezone);
  const yesterday = offsetDate(today, -1);
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

export default router;
