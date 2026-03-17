import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
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
import { shareOrDownloadMilestoneCard } from '../components/MilestoneCard';
import type { AnalyticsSummary } from '@gmh/shared/types/analytics';

// Hour thresholds for share prompts — in minutes
const HOUR_THRESHOLDS: Array<{ mins: number; label: string }> = [
  { mins: 600, label: '10 hours' },
  { mins: 1500, label: '25 hours' },
  { mins: 3000, label: '50 hours' },
  { mins: 6000, label: '100 hours' },
];

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
  const [shareLoading, setShareLoading] = useState(false);
  const [dismissedThresholds, setDismissedThresholds] = useState<Set<number>>(() => {
    const dismissed = new Set<number>();
    for (const t of HOUR_THRESHOLDS) {
      if (localStorage.getItem(`gmh_milestone_dismissed_${t.mins}`) === 'dismissed') {
        dismissed.add(t.mins);
      }
    }
    return dismissed;
  });

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
  const activePrompt = (() => {
    for (let i = HOUR_THRESHOLDS.length - 1; i >= 0; i--) {
      const t = HOUR_THRESHOLDS[i];
      if (totalMins >= t.mins && !dismissedThresholds.has(t.mins)) return t;
    }
    return null;
  })();
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

      {/* ─── Milestone share prompt ────────────────────────────── */}
      <Collapse in={Boolean(activePrompt) && !loading} unmountOnExit>
        {activePrompt && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={500}>
                You've practiced {activePrompt.label} — share this milestone!
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={shareLoading ? undefined : <ShareIcon sx={{ fontSize: 15 }} />}
                disabled={shareLoading}
                onClick={async () => {
                  setShareLoading(true);
                  try {
                    await shareOrDownloadMilestoneCard(
                      {
                        headline: `${activePrompt.label} Practiced`,
                        detail: 'Guitar Mastery Hub',
                        stat: activePrompt.label.split(' ')[0],
                        statLabel: 'total hours practiced',
                      },
                      `I've practiced ${activePrompt.label} on Guitar Mastery Hub!`,
                      `${activePrompt.label} of guitar practice and counting.`,
                      `milestone-${activePrompt.label.replace(/\s+/g, '-')}.png`,
                    );
                  } catch (err) {
                    if (!(err instanceof Error && err.name === 'AbortError')) {
                      // ignore
                    }
                  } finally {
                    setShareLoading(false);
                  }
                }}
                sx={{ fontSize: '0.7rem', textTransform: 'none', height: 28 }}
              >
                {shareLoading ? 'Generating…' : 'Share'}
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  localStorage.setItem(`gmh_milestone_dismissed_${activePrompt.mins}`, 'dismissed');
                  setDismissedThresholds((prev) => new Set([...prev, activePrompt.mins]));
                }}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Collapse>

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
                sx={{ display: 'block', mb: 2.5 }}
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
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
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
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
            Confidence Over Time
          </Typography>
          <ConfidenceTrendChart />
        </CardContent>
      </Card>

      {/* BPM trend chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
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
                sx={{ display: 'block', mb: 2.5 }}
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
                sx={{ display: 'block', mb: 2.5 }}
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
