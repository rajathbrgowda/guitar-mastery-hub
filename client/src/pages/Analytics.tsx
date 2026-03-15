import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';
import { useAnalyticsStore } from '../store/analyticsStore';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { SkillBreakdownChart } from '../components/SkillBreakdownChart';
import { ConfidenceTrendList } from '../components/ConfidenceTrendList';

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card sx={{ height: '100%', borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
      <CardContent>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={36} />
        ) : (
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const theme = useTheme();
  const {
    skillsData,
    activityHistory,
    loading,
    error,
    fetchSkillsAnalytics,
    fetchActivityHistory,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchSkillsAnalytics();
    fetchActivityHistory(30);
  }, [fetchSkillsAnalytics, fetchActivityHistory]);

  const totalMins = activityHistory.reduce((s, d) => s + d.duration_min, 0);
  const activeDays = activityHistory.filter((d) => d.duration_min > 0).length;
  const totalSessions = skillsData?.skills.reduce((s, sk) => s + sk.practice_count, 0) ?? 0;

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.04)}, transparent 60%)`,
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Row 1 — Stat tiles */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Active days', value: activeDays },
          { label: 'Total minutes', value: totalMins },
          { label: 'Skills practiced', value: skillsData?.skills.length ?? '—' },
          { label: 'Rated sessions', value: totalSessions || '—' },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <StatCard label={s.label} value={s.value} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2 — Activity heatmap */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            30-Day Activity
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          ) : activityHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No activity data yet.
            </Typography>
          ) : (
            <ActivityHeatmap data={activityHistory} />
          )}
        </CardContent>
      </Card>

      {/* Row 3 — 2-col: SkillBreakdownChart + ConfidenceTrendList */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 2 }}
              >
                By Category
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : (
                <SkillBreakdownChart byCategory={skillsData?.by_category ?? {}} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 2 }}
              >
                Confidence Trends
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : (
                <ConfidenceTrendList skills={skillsData?.skills ?? []} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 4 — Milestones stub */}
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Milestones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon — track phase completions and personal records.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
