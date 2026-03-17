import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import type { WeeklyHeatmapDay } from '@gmh/shared/types/analytics';

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

// GET /api/analytics/streak/detail — full streak data
router.get('/streak/detail', async (req: AuthRequest, res) => {
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
  const dates = (sessionsRes.data ?? []).map((r: { date: string }) => r.date);
  const unique = [...new Set(dates)].sort().reverse();

  const today = todayInTz(timezone);
  const yesterday = offsetDate(today, -1);

  // Current streak
  const currentStreak = calcStreak(dates, timezone);

  // Longest streak — iterate all dates
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedAsc = [...unique].reverse(); // oldest first
  for (let i = 1; i < sortedAsc.length; i++) {
    const expected = offsetDate(sortedAsc[i - 1], 1);
    if (sortedAsc[i] === expected) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  if (sortedAsc.length > 0) longestStreak = Math.max(longestStreak, 1);

  const lastPracticed = unique[0] ?? null;
  const atRisk = lastPracticed === yesterday && unique[0] !== today;

  res.json({
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_practiced: lastPracticed,
    at_risk: atRisk,
  });
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
      .select(
        'current_phase, timezone, selected_curriculum_key, streak_grace_week_used, streak_grace_week_start',
      )
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

  // Grace day: check if grace is available this week
  const graceWeekUsed: number = (userRes.data?.streak_grace_week_used as number) ?? 0;
  const graceWeekStart: string | null = (userRes.data?.streak_grace_week_start as string) ?? null;
  const todayLocal = todayInTz(timezone);
  const todayDate = new Date(todayLocal + 'T12:00:00Z');
  const dayOfWeek = todayDate.getUTCDay(); // 0=Sun, 1=Mon...
  // Reset grace on Monday (day 1) — if stored week start is before this Monday
  const lastMonday = offsetDate(todayLocal, -(dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const graceResetNeeded = !graceWeekStart || graceWeekStart < lastMonday;
  const effectiveGraceUsed = graceResetNeeded ? 0 : graceWeekUsed;
  const graceAvailable = effectiveGraceUsed < 1;
  const graceUsed = effectiveGraceUsed > 0;

  const streak = calcStreakWithGrace(
    sessions.map((s) => s.date),
    timezone,
    graceAvailable,
  );

  // Total hours by window
  const thirtyDaysAgoStr = offsetDate(todayLocal, -30);
  const sevenDaysAgoStr = offsetDate(todayLocal, -7);
  const mins7d = sessions
    .filter((s) => s.date >= sevenDaysAgoStr)
    .reduce((sum, s) => sum + s.duration_min, 0);
  const sessions30d = sessions.filter((s) => s.date >= thirtyDaysAgoStr);
  const mins30d = sessions30d.reduce((sum, s) => sum + s.duration_min, 0);
  const totalHours7d = Math.round((mins7d / 60) * 10) / 10;
  const totalHours30d = Math.round((mins30d / 60) * 10) / 10;
  const totalHoursAllTime = Math.round((totalMins / 60) * 10) / 10;
  const avgSessionMin30d = sessions30d.length > 0 ? Math.round(mins30d / sessions30d.length) : 0;

  // Last 7 days activity for mini chart
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

  res.json({
    totalMins,
    totalSessions,
    streak,
    currentPhase,
    last7,
    weakSpots,
    totalHours7d,
    totalHours30d,
    totalHoursAllTime,
    totalSessionsAllTime: totalSessions,
    avgSessionMin30d,
    graceAvailable,
    graceUsed,
  });
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
  return calcStreakWithGrace(dates, timezone, false);
}

function calcStreakWithGrace(dates: string[], timezone = 'UTC', graceAvailable = false): number {
  if (!dates.length) return 0;

  const unique = [...new Set(dates)].sort().reverse(); // newest first
  const today = todayInTz(timezone);
  const yesterday = offsetDate(today, -1);
  const twoDaysAgo = offsetDate(today, -2);

  // Streak only counts if practiced today or yesterday
  // With grace: also allow 2 days ago (grace covers the missed day)
  if (unique[0] !== today && unique[0] !== yesterday) {
    if (graceAvailable && unique[0] === twoDaysAgo) {
      // Grace covers the gap — streak starts from 2 days ago
    } else {
      return 0;
    }
  }

  let streak = 1;
  let graceUsedInCalc = false;
  for (let i = 1; i < unique.length; i++) {
    const expected = offsetDate(unique[i - 1], -1);
    if (unique[i] === expected) {
      streak++;
    } else if (!graceUsedInCalc && graceAvailable) {
      // Allow one gap (grace day) — check if the day before the gap matches
      const expectedAfterGrace = offsetDate(unique[i - 1], -2);
      if (unique[i] === expectedAfterGrace) {
        streak += 2; // count the grace day + the resumed day
        graceUsedInCalc = true;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Also handle the anchor gap: if practiced 2 days ago with grace
  if (
    graceAvailable &&
    unique[0] !== today &&
    unique[0] !== yesterday &&
    unique[0] === twoDaysAgo
  ) {
    streak++; // grace covers today/yesterday gap
  }

  return streak;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// GET /api/analytics/insights — skill confidence analysis + weekly digest
router.get('/insights', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // 1. Fetch user profile
  const { data: user } = await supabase
    .from('users')
    .select('current_phase, selected_curriculum_key, timezone')
    .eq('id', userId)
    .single();

  if (!user) {
    res.status(500).json({ error: 'User not found' });
    return;
  }

  const currentPhase: number = user.current_phase ?? 0;
  const curriculumKey: string = user.selected_curriculum_key ?? 'best_of_all';
  const timezone: string = user.timezone ?? 'UTC';

  // 2. Get this user's plan IDs from the last 14 days (for confidence lookup)
  //    Filtered by curriculum_key so confidence data never bleeds across curricula.
  const { data: userPlans } = await supabase
    .from('daily_practice_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey)
    .gte('plan_date', fourteenDaysAgo);

  const planIds = (userPlans ?? []).map((p: { id: string }) => p.id);

  // 3. Get rated plan items for those plans
  const ratedItems =
    planIds.length > 0
      ? ((
          await supabase
            .from('daily_practice_plan_items')
            .select('skill_id, confidence_rating, completed_at')
            .in('plan_id', planIds)
            .not('confidence_rating', 'is', null)
        ).data ?? [])
      : [];

  // 4. Aggregate confidence per skill_id
  const confidenceMap = new Map<string, { sum: number; count: number; last_at: string | null }>();
  for (const item of ratedItems) {
    if (!item.skill_id || item.confidence_rating == null) continue;
    const existing = confidenceMap.get(item.skill_id) ?? { sum: 0, count: 0, last_at: null };
    const last_at =
      existing.last_at && existing.last_at > (item.completed_at ?? '')
        ? existing.last_at
        : (item.completed_at ?? null);
    confidenceMap.set(item.skill_id, {
      sum: existing.sum + item.confidence_rating,
      count: existing.count + 1,
      last_at,
    });
  }

  // 5. Fetch curriculum source for current phase entries
  const { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  const curriculumId = curriculumSource?.id;
  type PhaseSkill = {
    skill_id: string;
    skills: { id: string; key: string; title: string; category: string } | null;
  };
  let phaseSkills: PhaseSkill[] = [];
  if (curriculumId) {
    const { data } = await supabase
      .from('curriculum_skill_entries')
      .select('skill_id, skills ( id, key, title, category )')
      .eq('curriculum_id', curriculumId)
      .eq('phase_number', currentPhase);
    phaseSkills = (data ?? []) as unknown as PhaseSkill[];
  }

  // 6. Build SkillInsight array for current phase skills
  type SkillInsightRow = {
    skill_id: string;
    skill_key: string;
    skill_title: string;
    skill_category: string;
    avg_confidence: number | null;
    practice_count: number;
    last_practiced_at: string | null;
  };
  const skillInsights: SkillInsightRow[] = [];
  for (const entry of phaseSkills) {
    const skill = entry.skills;
    if (!skill || skill.category === 'warmup') continue;
    const conf = confidenceMap.get(skill.id);
    skillInsights.push({
      skill_id: skill.id,
      skill_key: skill.key,
      skill_title: skill.title,
      skill_category: skill.category,
      avg_confidence: conf ? conf.sum / conf.count : null,
      practice_count: conf?.count ?? 0,
      last_practiced_at: conf?.last_at ?? null,
    });
  }

  const weakSkills = skillInsights
    .filter((s) => s.avg_confidence !== null && s.avg_confidence < 1.7)
    .sort((a, b) => (a.avg_confidence ?? 0) - (b.avg_confidence ?? 0));

  const strongSkills = skillInsights.filter(
    (s) => s.avg_confidence !== null && s.avg_confidence > 2.5 && s.practice_count >= 3,
  );

  const focusSkill = weakSkills[0] ?? null;

  // 7. Weekly digest from practice_sessions
  const { data: recentSessions } = await supabase
    .from('practice_sessions')
    .select('date, duration_min, sections')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo);

  const sessions = recentSessions ?? [];
  const sessionsCount = sessions.length;
  const totalMins = sessions.reduce((s, r) => s + r.duration_min, 0);
  const daysPracticed = new Set(sessions.filter((s) => s.duration_min > 0).map((s) => s.date)).size;

  // Top skill: most frequent in sections
  const sectionCount = new Map<string, number>();
  for (const session of sessions) {
    const sects: Array<{ name: string }> = session.sections ?? [];
    for (const s of sects) {
      sectionCount.set(s.name, (sectionCount.get(s.name) ?? 0) + 1);
    }
  }
  let topSkillTitle: string | null = null;
  let topCount = 0;
  for (const [name, count] of sectionCount) {
    if (count > topCount) {
      topCount = count;
      topSkillTitle = name;
    }
  }

  // week_start = today - 7 days in user's timezone
  const weekStart = offsetDateLocal(timezone, -7);

  res.json({
    weakSkills,
    strongSkills,
    weeklyDigest: {
      week_start: weekStart,
      sessions_count: sessionsCount,
      total_mins: totalMins,
      days_practiced: daysPracticed,
      top_skill_title: topSkillTitle,
    },
    focusSkill,
  });
});

function offsetDateLocal(timezone: string, days: number): string {
  const today = todayInTz(timezone);
  return offsetDate(today, days);
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

// GET /api/analytics/heatmap — 364 days (52 weeks) pre-shaped for heatmap grid
router.get('/heatmap', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const days = 364;
  const from = offsetDate(new Date().toISOString().split('T')[0], -(days - 1));

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

  const map: Record<string, number> = {};
  for (const r of data ?? []) {
    map[r.date] = (map[r.date] ?? 0) + r.duration_min;
  }

  const result: WeeklyHeatmapDay[] = [];

  for (let i = 0; i < days; i++) {
    const d = offsetDate(from, i);
    const jsDate = new Date(d + 'T12:00:00Z');
    result.push({
      date: d,
      duration_min: map[d] ?? 0,
      week: Math.floor(i / 7),
      day_of_week: jsDate.getUTCDay(),
    });
  }

  res.json(result);
});

// GET /api/analytics/skills — per-skill aggregation for last 30 days
router.get('/skills', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // 1. Get plan IDs in last 30 days
  const { data: plans } = await supabase
    .from('daily_practice_plans')
    .select('id')
    .eq('user_id', userId)
    .gte('plan_date', thirtyDaysAgo);

  const planIds = (plans ?? []).map((p: { id: string }) => p.id);

  if (planIds.length === 0) {
    res.json({ skills: [], by_category: {} });
    return;
  }

  // 2. Get completed items with skill info
  const { data: items, error } = await supabase
    .from('daily_practice_plan_items')
    .select(
      'skill_id, skill_title, skill_category, actual_duration_min, confidence_rating, completed_at, skills ( key )',
    )
    .in('plan_id', planIds)
    .not('completed_at', 'is', null);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // 3. Aggregate per skill_id
  type ItemRow = {
    skill_id: string;
    skill_title: string;
    skill_category: string;
    actual_duration_min: number | null;
    confidence_rating: number | null;
    completed_at: string | null;
    skills: { key: string } | null;
  };

  const skillMap = new Map<
    string,
    {
      skill_key: string;
      skill_title: string;
      skill_category: string;
      total_duration_min: number;
      ratings: Array<{ rating: number; completed_at: string }>;
    }
  >();

  for (const item of (items ?? []) as unknown as ItemRow[]) {
    if (!item.skill_id) continue;
    const existing = skillMap.get(item.skill_id) ?? {
      skill_key: (item.skills as { key: string } | null)?.key ?? '',
      skill_title: item.skill_title,
      skill_category: item.skill_category,
      total_duration_min: 0,
      ratings: [],
    };
    existing.total_duration_min += item.actual_duration_min ?? 0;
    if (item.confidence_rating != null && item.completed_at) {
      existing.ratings.push({ rating: item.confidence_rating, completed_at: item.completed_at });
    }
    skillMap.set(item.skill_id, existing);
  }

  // 4. Build response
  const skills: Array<{
    skill_id: string;
    skill_key: string;
    skill_title: string;
    skill_category: string;
    total_duration_min: number;
    avg_confidence: number | null;
    practice_count: number;
    last_5_ratings: number[];
  }> = [];
  const byCategory: Record<string, number> = {};

  for (const [skill_id, agg] of skillMap) {
    // Sort ratings by completed_at ascending, take last 5
    const sorted = agg.ratings.sort((a, b) => a.completed_at.localeCompare(b.completed_at));
    const last5 = sorted.slice(-5).map((r) => r.rating);
    const avg = sorted.length > 0 ? sorted.reduce((s, r) => s + r.rating, 0) / sorted.length : null;

    skills.push({
      skill_id,
      skill_key: agg.skill_key,
      skill_title: agg.skill_title,
      skill_category: agg.skill_category,
      total_duration_min: agg.total_duration_min,
      avg_confidence: avg,
      practice_count: sorted.length,
      last_5_ratings: last5,
    });

    const cat = agg.skill_category;
    byCategory[cat] = (byCategory[cat] ?? 0) + agg.total_duration_min;
  }

  // Sort by total_duration_min desc
  skills.sort((a, b) => b.total_duration_min - a.total_duration_min);

  res.json({ skills, by_category: byCategory });
});

// GET /api/analytics/insights/cards — computed motivational insight cards
router.get('/insights/cards', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [sessionsRes, userRes] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('date, duration_min, sections')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true }),
    supabase.from('users').select('timezone').eq('id', userId).single(),
  ]);

  const sessions = sessionsRes.data ?? [];
  const timezone = userRes.data?.timezone ?? 'UTC';
  void timezone; // available for future use

  const cards: Array<{
    type: string;
    title: string;
    body: string;
    value: string | number | null;
  }> = [];

  // Best day of week
  const dayTotals: Record<number, number> = {};
  for (const s of sessions) {
    const dow = new Date(s.date + 'T12:00:00Z').getUTCDay();
    dayTotals[dow] = (dayTotals[dow] ?? 0) + s.duration_min;
  }
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDow = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
  if (bestDow) {
    cards.push({
      type: 'best_day',
      title: 'Best practice day',
      body: `You practice most on ${DAY_NAMES[Number(bestDow[0])]}s`,
      value: DAY_NAMES[Number(bestDow[0])],
    });
  }

  // Most practiced skill
  const skillCount: Record<string, number> = {};
  for (const s of sessions) {
    const sects: Array<{ name: string }> = s.sections ?? [];
    for (const sec of sects) skillCount[sec.name] = (skillCount[sec.name] ?? 0) + 1;
  }
  const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0];
  if (topSkill) {
    cards.push({
      type: 'most_practiced',
      title: 'Most practiced skill',
      body: `You've worked on "${topSkill[0]}" ${topSkill[1]} times this month`,
      value: topSkill[0],
    });
  }

  // Consistency — days practiced / 30
  const activeDays = new Set(sessions.filter((s) => s.duration_min > 0).map((s) => s.date)).size;
  const consistencyPct = Math.round((activeDays / 30) * 100);
  cards.push({
    type: 'consistency',
    title: 'Monthly consistency',
    body: `You practiced on ${activeDays} of the last 30 days (${consistencyPct}%)`,
    value: consistencyPct,
  });

  res.json({ cards });
});

export default router;
