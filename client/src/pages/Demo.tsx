/**
 * Demo.tsx — Read-only dashboard pre-loaded with realistic seed data.
 * Public route: /demo. No auth required. No API calls.
 * Uses demoStore (Zustand) hydrated with hardcoded data.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useDemoStore, DEMO_SUMMARY } from '../store/demoStore';
import StatCard from '../components/StatCard';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

const PHASE_LABELS = ['Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Mastery'];
const PHASE_SKILL_COUNTS = [11, 9, 10, 9, 8];

function DisabledAction({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip title="Sign up to track your own progress" arrow placement="top">
      <Box sx={{ cursor: 'not-allowed', display: 'inline-flex' }}>
        <Box sx={{ pointerEvents: 'none', opacity: 0.55 }}>{children}</Box>
      </Box>
    </Tooltip>
  );
}

export default function Demo() {
  const navigate = useNavigate();
  const { sessions, skills, currentPhase } = useDemoStore();
  const { totalMins, totalSessions, streak, last7 } = DEMO_SUMMARY;

  const completedInPhase = skills.filter(
    (s) => s.phase_index === currentPhase && s.completed,
  ).length;
  const totalInPhase = PHASE_SKILL_COUNTS[currentPhase];
  const phaseProgress = Math.round((completedInPhase / totalInPhase) * 100);

  const recentSessions = sessions.slice(0, 5);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper' }}>
      {/* ── Demo banner ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          You are viewing a demo with sample data.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate('/login?mode=signup')}
          sx={{
            color: 'primary.contrastText',
            borderColor: 'rgba(255,255,255,0.5)',
            py: 0.25,
            px: 1.5,
            fontSize: '0.75rem',
            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          Sign up free →
        </Button>
      </Box>

      {/* ── App header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          Guitar Mastery Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" size="small" onClick={() => navigate('/')}>
            ← Back
          </Button>
          <Button variant="contained" size="small" onClick={() => navigate('/login?mode=signup')}>
            Sign up free
          </Button>
        </Box>
      </Box>

      {/* ── Dashboard content ──────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          Good evening, Demo User
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {streak}-day streak · {PHASE_LABELS[currentPhase]} phase
        </Typography>

        {/* Stats row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            icon={<LocalFireDepartmentOutlinedIcon />}
            label="Day streak"
            value={`${streak} days`}
          />
          <StatCard
            icon={<AccessTimeOutlinedIcon />}
            label="Total hours"
            value={`${Math.round(totalMins / 60)}h`}
          />
          <StatCard icon={<CalendarTodayOutlinedIcon />} label="Sessions" value={totalSessions} />
          <StatCard icon={<MapOutlinedIcon />} label="Phase" value={PHASE_LABELS[currentPhase]} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Recent sessions */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                Recent sessions
              </Typography>
              <List disablePadding>
                {recentSessions.map((s) => (
                  <ListItem
                    key={s.id}
                    disablePadding
                    sx={{
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(s.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {s.duration_min} min
                          </Typography>
                        </Box>
                      }
                      secondary={
                        s.notes && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.25, display: 'block' }}
                          >
                            {s.notes}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <DisabledAction>
                  <Button variant="contained" size="small" fullWidth>
                    Log a session
                  </Button>
                </DisabledAction>
              </Box>
            </CardContent>
          </Card>

          {/* Phase progress + weekly chart */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Phase progress */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  {PHASE_LABELS[currentPhase]} phase
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary">
                    {completedInPhase} of {totalInPhase} skills
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="primary.main">
                    {phaseProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={phaseProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>

            {/* Weekly bar chart */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Last 7 days
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 72 }}>
                  {last7.map((day) => {
                    const maxMin = Math.max(...last7.map((d) => d.duration_min), 1);
                    const heightPct =
                      day.duration_min > 0 ? Math.max((day.duration_min / maxMin) * 100, 12) : 4;
                    return (
                      <Box
                        key={day.date}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            bgcolor: day.duration_min > 0 ? 'primary.main' : 'divider',
                            borderRadius: '3px 3px 0 0',
                            height: `${heightPct}%`,
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.6rem' }}
                        >
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Demo CTA */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'primary.main',
            bgcolor: 'background.default',
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
            Like what you see?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign up free and start tracking your own progress today.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/login?mode=signup')}>
              Create free account
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to home
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
