import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import api from '../services/api';

const PHASE_LABELS = ['Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Mastery'];
const PHASE_LABELS_SHORT = ['Found.', 'Beginner', 'Inter.', 'Advanced', 'Mastery'];

interface Summary {
  totalMins: number;
  totalSessions: number;
  streak: number;
  currentPhase: number;
  last7: { date: string; duration_min: number }[];
}

const navItems = [
  { to: '/app/practice',  icon: <TimerOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,          label: 'Practice',   desc: 'Log a session & run the timer' },
  { to: '/app/roadmap',   icon: <MapOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,             label: 'Roadmap',    desc: '5-phase curriculum & skill checklists' },
  { to: '/app/skills',    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,     label: 'Skill Tree', desc: 'Visual node map of your progress' },
  { to: '/app/analytics', icon: <BarChartOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,        label: 'Analytics',  desc: 'Streak, total minutes & trends' },
  { to: '/app/resources', icon: <LibraryBooksOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,    label: 'Resources',  desc: 'Phase-mapped learning links' },
  { to: '/app/tools',     icon: <BuildOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />,           label: 'Tools',      desc: 'Curated apps for guitar learning' },
];

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card sx={{ borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Box
            sx={{
              width: 28, height: 28,
              bgcolor: '#fef3ee',
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
          <Typography
            sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there';

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Summary>('/api/analytics/summary')
      .then((r) => setSummary(r.data))
      .catch(() => {/* non-blocking */})
      .finally(() => setLoading(false));
  }, []);

  const phaseLabel = summary ? (PHASE_LABELS[summary.currentPhase] ?? `Phase ${summary.currentPhase}`) : '—';
  const dailyGoal = profile?.daily_goal_min ?? 20;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMins = summary?.last7?.find((d) => d.date === todayStr)?.duration_min ?? 0;
  const todayPct = Math.min(100, Math.round((todayMins / dailyGoal) * 100));

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hey, {name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {!summary || summary.totalSessions === 0
            ? 'No sessions yet. Log your first practice to get started.'
            : 'Welcome back. Keep the streak going.'}
        </Typography>
      </Box>

      {/* 2-column layout */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* ── LEFT: stats + goal + phase ── */}
        <Grid size={{ xs: 12, sm: 7 }}>
          {/* Stat cards */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<LocalFireDepartmentOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="Streak"
                value={summary ? `${summary.streak}d` : '—'}
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<AccessTimeOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="Minutes"
                value={summary?.totalMins ?? '—'}
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatCard
                icon={<EventNoteOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />}
                label="Sessions"
                value={summary?.totalSessions ?? '—'}
                loading={loading}
              />
            </Grid>
          </Grid>

          {/* Today's goal */}
          {!loading && (
            <Card sx={{ mb: 2, borderLeft: '3px solid', borderLeftColor: todayPct >= 100 ? 'success.main' : 'primary.main' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Today's goal
                  </Typography>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', fontWeight: 600, color: todayPct >= 100 ? 'success.main' : 'text.primary' }}>
                    {todayMins} / {dailyGoal} min {todayPct >= 100 ? '✓' : `— ${todayPct}%`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={todayPct}
                  color={todayPct >= 100 ? 'success' : 'primary'}
                  sx={{ height: 5 }}
                />
              </CardContent>
            </Card>
          )}

          {/* Phase progress */}
          {!loading && summary && (
            <Card>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}
                  >
                    Current Phase
                  </Typography>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'text.secondary' }}>
                    {summary.currentPhase + 1} / {PHASE_LABELS.length}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75, lineHeight: 1.2 }}>
                  {phaseLabel}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((summary.currentPhase + 1) / PHASE_LABELS.length) * 100}
                  sx={{ height: 5, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {PHASE_LABELS_SHORT.map((label, i) => (
                    <Typography
                      key={label}
                      variant="caption"
                      sx={{
                        fontSize: '0.6rem',
                        color: i === summary.currentPhase ? 'primary.main' : 'text.disabled',
                        fontWeight: i === summary.currentPhase ? 700 : 400,
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
          {loading && <Skeleton variant="rounded" height={100} />}
        </Grid>

        {/* ── RIGHT: navigation list ── */}
        <Grid size={{ xs: 12, sm: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ pb: '8px !important', pt: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, px: 1, display: 'block', mb: 0.5 }}
              >
                Navigate
              </Typography>
              <List disablePadding>
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    sx={{
                      py: 0.875,
                      px: 1,
                      borderRadius: 1,
                      mb: 0.25,
                      '&:hover': { bgcolor: '#fef3ee' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Box
                        sx={{
                          width: 28, height: 28,
                          bgcolor: '#fef3ee',
                          borderRadius: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.desc}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}
                      secondaryTypographyProps={{ fontSize: '0.7rem', noWrap: true }}
                    />
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
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
