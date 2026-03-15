import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

interface WeeklyPaceEstimateProps {
  phase: RoadmapPhase;
  sessionsLast7: number; // sessions in last 7 days
}

export function WeeklyPaceEstimate({ phase, sessionsLast7 }: WeeklyPaceEstimateProps) {
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

  if (sessionsLast7 === 0) {
    return (
      <Typography variant="caption" color="text.disabled">
        Practice regularly to see your pace estimate
      </Typography>
    );
  }

  const skillsPerWeek = sessionsLast7 * 2;
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
