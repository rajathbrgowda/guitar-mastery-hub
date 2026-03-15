import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { useProgressStore } from '../store/progressStore';
import api from '../services/api';

const PHASE_LABELS = ['Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Mastery'];
const PHASE_LABELS_SHORT = ['Found.', 'Beginner', 'Inter.', 'Advanced', 'Mastery'];
// Skill counts per phase matching Roadmap.tsx curriculum
const PHASE_SKILL_COUNTS = [11, 9, 10, 9, 8];
const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Summary {
  totalMins: number;
  totalSessions: number;
  streak: number;
  currentPhase: number;
  last7: { date: string; duration_min: number }[];
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function streakCopy(streak: number): string {
  if (streak === 0) return 'Start today';
  if (streak < 7) return 'Building momentum';
  if (streak < 14) return 'One week! Keep it up';
  if (streak < 30) return 'Two weeks strong';
  return "You're unstoppable";
}

function StatCard({
  icon,
  label,
  value,
  sub,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card sx={{ borderLeft: '3px solid', borderLeftColor: accent ? 'success.main' : 'primary.main' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Box
            sx={{
              width: 28, height: 28,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton width={60} height={32} />
        ) : (
          <>
            <Typography
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}
            >
              {value}
            </Typography>
            {sub && <Box sx={{ mt: 0.75 }}>{sub}</Box>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const { profile } = useUserStore();
  const { skills, currentPhase: storePhase, fetchProgress } = useProgressStore();
  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there';

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Summary>('/api/analytics/summary')
      .then((r) => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchProgress();
  }, [fetchProgress]);

  const phaseLabel = PHASE_LABELS[storePhase] ?? `Phase ${storePhase}`;
  const dailyGoal = profile?.daily_goal_min ?? 20;
  const daysTarget = profile?.practice_days_target ?? 5;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMins = summary?.last7?.find((d) => d.date === todayStr)?.duration_min ?? 0;
  const todayPct = Math.min(100, Math.round((todayMins / dailyGoal) * 100));
  const daysPracticed = summary?.last7?.filter((d) => d.duration_min > 0).length ?? 0;

  // Phase skills progress
  const phaseTotal = PHASE_SKILL_COUNTS[storePhase] ?? 0;
  const phaseCompleted = skills.filter((s) => s.phase_index === storePhase && s.completed).length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  // 7-day chart data sorted oldest → newest
  const chartData = [...(summary?.last7 ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      day: DAY_INITIALS[new Date(d.date + 'T00:00:00').getDay()],
      mins: d.duration_min,
    }));

  // Last session for Practice status row
  const lastSession = [...(summary?.last7 ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((d) => d.duration_min > 0);
  const practiceStatus = lastSession
    ? `Last: ${new Date(lastSession.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })} · ${lastSession.duration_min} min`
    : 'Log your first session';

  const navItems = [
    {
      to: '/app/practice',
      icon: <TimerOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Practice',
      status: loading ? '…' : practiceStatus,
    },
    {
      to: '/app/roadmap',
      icon: <MapOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Roadmap',
      status: `Phase ${storePhase + 1} · ${phaseCompleted}/${phaseTotal} skills`,
    },
    {
      to: '/app/skills',
      icon: <AccountTreeOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Skill Tree',
      status: `${phaseLabel} ${phasePct}%`,
    },
    {
      to: '/app/resources',
      icon: <LibraryBooksOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Resources',
      status: 'Browse resources',
    },
    {
      to: '/app/analytics',
      icon: <BarChartOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Analytics',
      status: 'View trends',
    },
    {
      to: '/app/tools',
      icon: <BuildOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />,
      label: 'Tools',
      status: '11 apps rated',
    },
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Good {timeOfDay()}, {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {profile?.guitar_type
            ? `${profile.guitar_type.charAt(0).toUpperCase() + profile.guitar_type.slice(1)} · ${profile.years_playing ?? 0} yr${(profile.years_playing ?? 0) !== 1 ? 's' : ''} · Phase ${storePhase + 1} — ${phaseLabel}`
            : `Phase ${storePhase + 1} — ${phaseLabel}`}
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT: stat cards + 7-day chart */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {/* Streak */}
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<LocalFireDepartmentOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="Streak"
                value={loading ? '—' : `${summary?.streak ?? 0}d`}
                sub={
                  !loading && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {streakCopy(summary?.streak ?? 0)}
                    </Typography>
                  )
                }
                loading={loading}
              />
            </Grid>

            {/* Today */}
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<AccessTimeOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="Today"
                value={loading ? '—' : `${todayMins}/${dailyGoal}m`}
                sub={
                  !loading && (
                    <LinearProgress
                      variant="determinate"
                      value={todayPct}
                      color={todayPct >= 100 ? 'success' : 'primary'}
                      sx={{ height: 4 }}
                    />
                  )
                }
                loading={loading}
                accent={todayPct >= 100}
              />
            </Grid>

            {/* This week */}
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<CalendarTodayOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="This week"
                value={loading ? '—' : `${daysPracticed}/${daysTarget}d`}
                loading={loading}
              />
            </Grid>
          </Grid>

          {/* 7-day mini bar chart */}
          {!loading && chartData.length > 0 && (
            <Card>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, display: 'block', mb: 1 }}
                >
                  Last 7 days
                </Typography>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fill: '#5c5858' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${v ?? 0} min`, '']}
                      contentStyle={{ fontSize: '0.75rem', borderRadius: 6, border: '1px solid #e5e0df' }}
                      cursor={{ fill: alpha(primaryColor, 0.08) }}
                    />
                    <Bar dataKey="mins" fill={primaryColor} radius={[3, 3, 0, 0]} minPointSize={2} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {loading && <Skeleton variant="rounded" height={120} />}
        </Grid>

        {/* RIGHT: phase progress + section status list */}
        <Grid size={{ xs: 12, sm: 5 }}>
          {/* Phase progress */}
          {!loading && summary && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}
                  >
                    Current Phase
                  </Typography>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'text.secondary' }}>
                    {storePhase + 1} / {PHASE_LABELS.length}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75, lineHeight: 1.2 }}>
                  {phaseLabel}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((storePhase + 1) / PHASE_LABELS.length) * 100}
                  sx={{ height: 5, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {PHASE_LABELS_SHORT.map((label, i) => (
                    <Typography
                      key={label}
                      variant="caption"
                      sx={{
                        fontSize: '0.6rem',
                        color: i === storePhase ? 'primary.main' : 'text.disabled',
                        fontWeight: i === storePhase ? 700 : 400,
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
          {loading && <Skeleton variant="rounded" height={90} sx={{ mb: 2 }} />}

          {/* Section status list */}
          <Card>
            <CardContent sx={{ pb: '8px !important', pt: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, px: 1, display: 'block', mb: 0.5 }}
              >
                Sections
              </Typography>
              <List disablePadding>
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    sx={{
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      mb: 0.25,
                      '&:hover': { bgcolor: alpha(primaryColor, 0.08) },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Box
                        sx={{
                          width: 24, height: 24,
                          bgcolor: alpha(primaryColor, 0.1),
                          borderRadius: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.status}
                      primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}
                      secondaryTypographyProps={{ fontSize: '0.68rem', noWrap: true }}
                    />
                    <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
