import { Router } from 'express';
import { supabase } from '../lib/supabase';
import type { PublicStats } from '@gmh/shared/types';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [usersResult, sessionsResult, minutesResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('practice_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('practice_sessions').select('duration_min'),
    ]);

    const totalMinutes = (minutesResult.data ?? []).reduce(
      (sum: number, row: { duration_min: number | null }) => sum + (row.duration_min ?? 0),
      0,
    );

    const stats: PublicStats = {
      total_users: usersResult.count ?? 0,
      total_sessions: sessionsResult.count ?? 0,
      total_practice_minutes: totalMinutes,
      active_streaks: 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
