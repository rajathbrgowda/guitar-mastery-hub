import { useEffect, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { useProgressStore } from '../store/progressStore';
import { api } from '../services/api';
import { TodaysPractice } from '../components/TodaysPractice';
import { PhaseMap } from '../components/PhaseMap';
import { WeekCalendar } from '../components/WeekCalendar';
import type { AnalyticsSummary } from '@gmh/shared/types/analytics';

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function streakMessage(streak: number): { text: string; emoji: string } {
  if (streak === 0) return { text: 'Start today — one session makes a streak', emoji: '🎸' };
  if (streak === 1) return { text: 'Day 1. The hardest streak to start.', emoji: '🌱' };
  if (streak < 7) return { text: `${streak} days in a row. Keep the momentum.`, emoji: '🔥' };
  if (streak < 14)
    return { text: `A full week of practice. You're building a habit.`, emoji: '💪' };
  if (streak < 30)
    return { text: `${streak} days strong. Consistency is the secret.`, emoji: '🚀' };
  return { text: `${streak} day streak. You're unstoppable.`, emoji: '🏆' };
}

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const { profile } = useUserStore();
  const { skills, currentPhase: storePhase, fetchProgress } = useProgressStore();

  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there';
  const dailyGoal = profile?.daily_goal_min ?? 20;
  const daysTarget = profile?.practice_days_target ?? 5;

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<AnalyticsSummary>('/api/analytics/summary').then((r) => setSummary(r.data)),
      fetchProgress(),
    ])
      .catch(() => setSummaryError(true))
      .finally(() => setSummaryLoading(false));
  }, [fetchProgress]);

  // Derived values
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMins = summary?.last7?.find((d) => d.date === todayStr)?.duration_min ?? 0;
  const todayPct = Math.min(100, Math.round((todayMins / (dailyGoal || 20)) * 100));
  const daysPracticed = summary?.last7?.filter((d) => d.duration_min > 0).length ?? 0;
  const streak = summary?.streak ?? 0;
  const { text: streakText, emoji: streakEmoji } = streakMessage(streak);

  // Phase completion %
  const PHASE_SKILL_COUNTS = [11, 9, 10, 9, 8];
  const phaseTotal = PHASE_SKILL_COUNTS[storePhase] ?? 0;
  const phaseCompleted = skills.filter((s) => s.phase_index === storePhase && s.completed).length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  // Chart data
  const chartData = [...(summary?.last7 ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      day: DAY_INITIALS[new Date(d.date + 'T00:00:00').getDay()],
      mins: d.duration_min,
    }));

  const isFirstTime = !summaryLoading && summary?.totalSessions === 0;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* ─── ZONE 1: Greeting ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
              Good {timeOfDay()}, {name} {streakEmoji}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {streakText}
            </Typography>
          </Box>

          {/* Streak badge */}
          {!summaryLoading && streak > 0 && (
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ fontSize: '1rem !important' }} />}
              label={`${streak} day streak`}
              color={streak >= 7 ? 'error' : 'warning'}
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.75rem', height: 32 }}
            />
          )}
        </Box>

        {/* Today's goal progress */}
        {!summaryLoading && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Today's goal
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color={todayPct >= 100 ? 'success.main' : 'text.primary'}
                >
                  {todayMins} / {dailyGoal} min {todayPct >= 100 && '✓'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={todayPct}
                color={todayPct >= 100 ? 'success' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Chip
              label={`${daysPracticed}/${daysTarget} days`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        )}
        {summaryLoading && <Skeleton variant="rounded" height={36} sx={{ mt: 2 }} />}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ─── ZONE 2 + 3: Two-column layout ──────────────────────────── */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT: Today's Practice (Zone 2) */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 0 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <TodaysPractice />
            </CardContent>
          </Card>

          {/* First-time user CTA */}
          {isFirstTime && (
            <Paper
              variant="outlined"
              sx={{ p: 2.5, mt: 2, borderRadius: 2, borderStyle: 'dashed', textAlign: 'center' }}
            >
              <EmojiEventsIcon sx={{ fontSize: 36, color: 'warning.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Welcome to Guitar Mastery Hub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Log your first practice session to start tracking your journey. Your personalized
                practice plan will appear here once you've logged a session.
              </Typography>
              <Button variant="contained" size="small" href="/app/practice">
                Log first session
              </Button>
            </Paper>
          )}
        </Grid>

        {/* RIGHT: Progress + Stats (Zone 3) */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Phase map */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.6rem',
                  }}
                >
                  Your Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Phase {storePhase + 1} · {phasePct}% done
                </Typography>
              </Box>
              <PhaseMap
                currentPhase={storePhase + 1}
                phaseCompletion={[
                  storePhase === 0 ? phasePct : storePhase > 0 ? 100 : 0,
                  storePhase === 1 ? phasePct : storePhase > 1 ? 100 : 0,
                  storePhase === 2 ? phasePct : storePhase > 2 ? 100 : 0,
                  storePhase === 3 ? phasePct : storePhase > 3 ? 100 : 0,
                  storePhase === 4 ? phasePct : 0,
                ]}
              />
            </CardContent>
          </Card>

          {/* Week calendar */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {summaryLoading ? (
                <Skeleton variant="rounded" height={60} />
              ) : (
                <WeekCalendar last7={summary?.last7 ?? []} />
              )}
            </CardContent>
          </Card>

          {/* 7-day bar chart */}
          {!summaryLoading && chartData.some((d) => d.mins > 0) && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2, pb: '8px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.6rem',
                    }}
                  >
                    Last 7 days
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {summary?.totalMins ?? 0} min total
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={72}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tick={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 9,
                        fill: theme.palette.text.disabled,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      formatter={(v) => [`${v ?? 0} min`, '']}
                      contentStyle={{
                        fontSize: '0.7rem',
                        borderRadius: 6,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.08) }}
                    />
                    <Bar
                      dataKey="mins"
                      fill={theme.palette.primary.main}
                      radius={[3, 3, 0, 0]}
                      minPointSize={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Weak spots */}
          {!summaryLoading && (summary?.weakSpots?.length ?? 0) > 0 && (
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.6rem',
                      color: 'warning.main',
                    }}
                  >
                    Needs attention
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {(summary?.weakSpots ?? []).slice(0, 4).map((spot) => (
                    <Box
                      key={spot.skill_key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" noWrap sx={{ flex: 1, mr: 1 }}>
                        {spot.skill_title}
                      </Typography>
                      <Chip
                        label={`${spot.practice_count_last7}× this week`}
                        size="small"
                        color={spot.practice_count_last7 === 0 ? 'error' : 'warning'}
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Summary error */}
          {summaryError && (
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Could not load stats. Check your connection.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
