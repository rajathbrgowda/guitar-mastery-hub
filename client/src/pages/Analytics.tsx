import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { alpha, useTheme } from '@mui/material/styles';
import { useAnalyticsStore } from '../store/analyticsStore';
import { YearHeatmap } from '../components/YearHeatmap';
import { SkillBreakdownChart } from '../components/SkillBreakdownChart';
import { ConfidenceTrendList } from '../components/ConfidenceTrendList';
import { StreakDisplay } from '../components/StreakDisplay';
import { InsightCards } from '../components/InsightCards';
import { ConfidenceTrendChart } from '../components/ConfidenceTrendChart';
import { BpmTrendChart } from '../components/BpmTrendChart';
import { useMilestoneStore } from '../store/milestoneStore';
import { MilestoneBadge } from '../components/MilestoneBadge';
import { api } from '../services/api';
import type { AnalyticsSummary } from '@gmh/shared/types/analytics';

function formatHours(hours: number): string {
  if (hours === 0) return '0';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
}

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
    heatmapData,
    streakData,
    insightCards,
    loading,
    error,
    fetchSkillsAnalytics,
    fetchActivityHistory,
    fetchHeatmap,
    fetchStreakDetail,
    fetchInsightCards,
  } = useAnalyticsStore();
  const milestoneStore = useMilestoneStore();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetchSkillsAnalytics();
    fetchActivityHistory(365);
    fetchHeatmap();
    fetchStreakDetail();
    fetchInsightCards();
    api
      .get<AnalyticsSummary>('/api/analytics/summary')
      .then((r) => setSummary(r.data))
      .catch(() => {});
  }, [
    fetchSkillsAnalytics,
    fetchActivityHistory,
    fetchHeatmap,
    fetchStreakDetail,
    fetchInsightCards,
  ]);

  const totalMins = activityHistory.reduce((s, d) => s + d.duration_min, 0);
  const activeDays = activityHistory.filter((d) => d.duration_min > 0).length;
  const totalSessions = skillsData?.skills.reduce((s, sk) => s + sk.practice_count, 0) ?? 0;

  // Technique skill keys for BPM chart
  const techniqueSkillKeys = (skillsData?.skills ?? [])
    .filter((s) => s.skill_category === 'technique')
    .map((s) => s.skill_key);

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.04)}, transparent 60%)`,
      }}
    >
      {/* ─── Hero: Total Hours ─────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' }, mb: 1.5 }}
        >
          Analytics
        </Typography>

        {summary ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'This week', value: formatHours(summary.totalHours7d) },
              { label: 'This month', value: formatHours(summary.totalHours30d) },
              { label: 'All time', value: formatHours(summary.totalHoursAllTime) },
            ].map((item) => (
              <Box key={item.label}>
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Skeleton variant="rounded" width={300} height={50} />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ─── Stat tiles ──────────────────────────────────────────── */}
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

      {/* Streak + insights */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Card>
            <CardContent>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 2 }}
              >
                Streak
              </Typography>
              {streakData ? (
                <StreakDisplay streakData={streakData} />
              ) : (
                <Skeleton variant="rectangular" height={80} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 7 }}>
          <Card>
            <CardContent>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Insights
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <InsightCards cards={insightCards} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 52-week heatmap */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            52-Week Activity
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          ) : heatmapData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No activity data yet.
            </Typography>
          ) : (
            <YearHeatmap data={heatmapData} />
          )}
        </CardContent>
      </Card>

      {/* Confidence trend chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Confidence Over Time
          </Typography>
          <ConfidenceTrendChart />
        </CardContent>
      </Card>

      {/* BPM trend chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Speed Progress (BPM)
          </Typography>
          <BpmTrendChart techniqueSkillKeys={techniqueSkillKeys} />
        </CardContent>
      </Card>

      {/* By Category + Confidence Trends */}
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
                Per-Skill Confidence
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

      {/* Milestones */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.6rem',
            fontWeight: 600,
            display: 'block',
            mb: 2,
          }}
        >
          Achievements ({milestoneStore.earnedCount} / {milestoneStore.totalCount})
        </Typography>
        {!milestoneStore.isLoading && milestoneStore.milestones.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Complete your first session to earn your first badge.
          </Typography>
        )}
        <Grid container spacing={1.5}>
          {milestoneStore.milestones.map((m) => (
            <Grid key={m.key} size={{ xs: 6, sm: 4, md: 4 }}>
              <MilestoneBadge milestone={m} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
