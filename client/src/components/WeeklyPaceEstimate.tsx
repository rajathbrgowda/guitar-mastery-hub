import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

interface WeeklyPaceEstimateProps {
  phase: RoadmapPhase;
  skillsPerWeek: number | null; // from API: 4-week lookback average, null if < 7 days data
}

export function WeeklyPaceEstimate({ phase, skillsPerWeek }: WeeklyPaceEstimateProps) {
  const remaining = phase.total_skills - phase.completed_skills;

  if (remaining === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
        <Typography variant="caption" color="success.main" fontWeight={600}>
          Phase complete!
        </Typography>
      </Box>
    );
  }

  if (skillsPerWeek == null || skillsPerWeek === 0) {
    return (
      <Typography variant="caption" color="text.disabled">
        Practice regularly to see your pace estimate
      </Typography>
    );
  }

  const weeksRemaining = Math.ceil(remaining / skillsPerWeek);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <TrendingUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
      <Typography variant="caption" color="text.secondary">
        At this pace, Phase {phase.phase_number} in{' '}
        <strong>
          ~{weeksRemaining} {weeksRemaining === 1 ? 'week' : 'weeks'}
        </strong>
      </Typography>
    </Box>
  );
}
