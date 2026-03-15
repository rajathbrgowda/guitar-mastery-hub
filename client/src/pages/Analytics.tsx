import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import api from '../services/api';

interface Summary {
  totalMins: number;
  totalSessions: number;
  streak: number;
  currentPhase: number;
}

interface DayData {
  date: string;
  duration_min: number;
}

type Range = '30' | '90';

function StatCard({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return (
    <Card sx={{ height: '100%', borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={36} />
        ) : (
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.5rem', fontWeight: 700, mt: 0.5 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {format(parseISO(label), 'EEE, MMM d')}
      </Typography>
      <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '0.85rem' }}>
        {payload[0].value} min
      </Typography>
    </Box>
  );
}

export default function Analytics() {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<Range>('30');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<Summary>('/api/analytics/summary'),
      api.get<DayData[]>(`/api/analytics/history?days=${range}`),
    ])
      .then(([s, h]) => {
        setSummary(s.data);
        setHistory(h.data);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [range]);

  // Weekly buckets for bar chart
  const chartData = (() => {
    if (!history.length) return [];
    // Group into weeks of 7 days
    const weeks: { week: string; duration_min: number }[] = [];
    for (let i = 0; i < history.length; i += 7) {
      const slice = history.slice(i, i + 7);
      const total = slice.reduce((s, d) => s + d.duration_min, 0);
      weeks.push({ week: format(parseISO(slice[0].date), 'MMM d'), duration_min: total });
    }
    return weeks;
  })();

  // Daily chart for 30-day view
  const dailyData = history.map((d) => ({
    date: d.date,
    duration_min: d.duration_min,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  const activeDays = history.filter((d) => d.duration_min > 0).length;
  const avgPerActiveDay = activeDays
    ? Math.round(history.reduce((s, d) => s + d.duration_min, 0) / activeDays)
    : 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Analytics
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total sessions', value: summary?.totalSessions ?? '—' },
          { label: 'Total minutes', value: summary?.totalMins ?? '—' },
          { label: 'Current streak', value: summary ? `${summary.streak}d` : '—' },
          { label: `Avg (active days)`, value: activeDays ? `${avgPerActiveDay} min` : '—' },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <StatCard label={s.label} value={s.value} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Practice minutes
            </Typography>
            <ToggleButtonGroup
              value={range}
              exclusive
              onChange={(_, v) => v && setRange(v)}
              size="small"
            >
              <ToggleButton value="30" sx={{ px: 1.5, textTransform: 'none', fontSize: '0.75rem' }}>
                30 days
              </ToggleButton>
              <ToggleButton value="90" sx={{ px: 1.5, textTransform: 'none', fontSize: '0.75rem' }}>
                90 days
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
          ) : history.every((d) => d.duration_min === 0) ? (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No sessions in this period yet.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              {range === '30' ? (
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0df" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#5c5858' }}
                    interval={6}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#5c5858' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(primaryColor, 0.08) }} />
                  <Bar dataKey="duration_min" fill={primaryColor} radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0df" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#5c5858' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#5c5858' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(primaryColor, 0.08) }} />
                  <Bar dataKey="duration_min" fill={primaryColor} radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}

          <Box sx={{ display: 'flex', gap: 3, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active days
              </Typography>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>
                {activeDays} / {history.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total in period
              </Typography>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>
                {history.reduce((s, d) => s + d.duration_min, 0)} min
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
