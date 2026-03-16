import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format, startOfISOWeek } from 'date-fns';
import { usePracticeStore } from '../store/practiceStore';
import { useUserStore } from '../store/userStore';
import type { PracticeSession } from '../types/practice';
import type { QuickLogPayload, SessionGroup } from '@gmh/shared/types';
import WeekStrip from '../components/WeekStrip';
import TodayHeroCard from '../components/TodayHeroCard';

function groupByWeek(sessions: PracticeSession[]): SessionGroup[] {
  const map = new Map<string, { label: string; sessions: PracticeSession[] }>();
  for (const s of sessions) {
    const d = new Date(s.date + 'T12:00:00');
    const weekStart = startOfISOWeek(d);
    const key = format(weekStart, 'yyyy-[W]II');
    const label = `Week of ${format(weekStart, 'MMM d')}`;
    if (!map.has(key)) map.set(key, { label, sessions: [] });
    map.get(key)!.sessions.push(s);
  }
  return Array.from(map.values()).map((g) => ({
    week_label: g.label,
    sessions: g.sessions,
  }));
}

function SessionRow({ s }: { s: PracticeSession }) {
  return (
    <Card
      sx={{
        mb: 1,
        borderLeft: '3px solid',
        borderLeftColor:
          s.duration_min > 45 ? 'success.main' : s.duration_min >= 20 ? 'warning.main' : 'divider',
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight={600}>
                {format(new Date(s.date + 'T12:00:00'), 'EEE, MMM d')}
              </Typography>
              {s.confidence != null && (
                <Chip
                  label={s.confidence === 3 ? 'Easy' : s.confidence === 2 ? 'Okay' : 'Hard'}
                  size="small"
                  color={s.confidence === 3 ? 'success' : s.confidence === 2 ? 'warning' : 'error'}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
            {s.notes && (
              <Typography variant="caption" color="text.secondary">
                {s.notes}
              </Typography>
            )}
            {s.sections && s.sections.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {s.sections.map((sec, i) => (
                  <Chip
                    key={`${sec.name}-${i}`}
                    label={`${sec.name} ${sec.duration_min}m`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
              color: 'primary.main',
              ml: 2,
              flexShrink: 0,
            }}
          >
            {s.duration_min} min
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function WeekGroup({
  group,
  isOpen,
  onToggle,
}: {
  group: SessionGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const weekTotal = group.sessions.reduce((s, r) => s + r.duration_min, 0);

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          py: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        onClick={onToggle}
      >
        <Typography variant="body2" fontWeight={600}>
          {group.week_label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.8rem',
              color: 'text.secondary',
            }}
          >
            {weekTotal} min · {group.sessions.length} session
            {group.sessions.length !== 1 ? 's' : ''}
          </Typography>
          {isOpen ? (
            <KeyboardArrowUpIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          )}
        </Box>
      </Box>
      <Collapse in={isOpen}>
        <Box sx={{ mt: 1 }}>
          {group.sessions.map((s) => (
            <SessionRow key={s.id} s={s} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function Practice() {
  const { sessions, weekDays, loading, weekLoading, error, fetchSessions, fetchWeek, logSession } =
    usePracticeStore();
  const { profile } = useUserStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [openWeek, setOpenWeek] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions({ from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') });
    fetchWeek();
  }, [fetchSessions, fetchWeek]);

  // Auto-open the current week group on load
  useEffect(() => {
    if (!loading && sessions.length > 0) {
      const currentWeekStart = startOfISOWeek(new Date());
      const key = `Week of ${format(currentWeekStart, 'MMM d')}`;
      setOpenWeek(key);
    }
  }, [loading, sessions]);

  const todaySessions = sessions.filter((s) => s.date === todayStr);

  async function handleLog(payload: QuickLogPayload) {
    await logSession({
      date: payload.date,
      duration_min: payload.duration_min,
      notes: payload.notes,
      confidence: payload.confidence,
    });
    fetchWeek();
  }

  // Daily goal progress
  const goal = profile?.daily_goal_min ?? 20;
  const todayMins = todaySessions.reduce((sum, s) => sum + s.duration_min, 0);
  const goalPct = Math.min(100, Math.round((todayMins / goal) * 100));

  // Stats (last 30 days)
  const totalMins = sessions.reduce((s, r) => s + r.duration_min, 0);
  const avgMins = sessions.length > 0 ? Math.round(totalMins / sessions.length) : 0;
  const longest = sessions.length > 0 ? Math.max(...sessions.map((r) => r.duration_min)) : 0;

  // Grouped history
  const groups = groupByWeek(sessions);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
      >
        Practice
      </Typography>

      {/* Daily goal */}
      <Card
        sx={{
          mb: 3,
          borderLeft: '3px solid',
          borderLeftColor: goalPct >= 100 ? 'success.main' : 'primary.main',
        }}
      >
        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Today's goal
            </Typography>
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: goalPct >= 100 ? 'success.main' : 'text.secondary',
              }}
            >
              {todayMins} / {goal} min {goalPct >= 100 ? '✓' : `— ${goalPct}%`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={goalPct}
            color={goalPct >= 100 ? 'success' : 'primary'}
            sx={{ height: 5 }}
          />
        </CardContent>
      </Card>

      {/* Week strip */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            This week
          </Typography>
          <WeekStrip days={weekDays} todayStr={todayStr} loading={weekLoading} />
        </CardContent>
      </Card>

      {/* Today hero card — quick-log or timer */}
      <TodayHeroCard todaySessions={todaySessions} todayStr={todayStr} onLog={handleLog} />

      {/* Stats strip */}
      {!loading && sessions.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'SESSIONS', value: sessions.length },
            { label: 'TOTAL MIN', value: totalMins },
            { label: 'AVG MIN', value: avgMins },
            { label: 'LONGEST', value: `${longest} min` },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{ height: '100%', borderLeft: '3px solid', borderLeftColor: 'primary.main' }}
              >
                <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Session history — grouped by week */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Last 30 days
      </Typography>

      {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && sessions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            No sessions yet — log your first practice above.
          </Typography>
        </Box>
      )}

      {!loading &&
        groups.map((group) => (
          <WeekGroup
            key={group.week_label}
            group={group}
            isOpen={openWeek === group.week_label}
            onToggle={() => setOpenWeek(openWeek === group.week_label ? null : group.week_label)}
          />
        ))}

      {/* Expand all button when there are multiple groups */}
      {!loading && groups.length > 1 && (
        <Button
          size="small"
          variant="text"
          sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }}
          onClick={() => setOpenWeek(null)}
        >
          Collapse all
        </Button>
      )}
    </Box>
  );
}
