import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { alpha, useTheme } from '@mui/material/styles';
import type { StreakData } from '@gmh/shared/types/analytics';

interface StreakDisplayProps {
  streakData: StreakData;
}

export function StreakDisplay({ streakData }: StreakDisplayProps) {
  const theme = useTheme();
  const { current_streak, longest_streak, at_risk } = streakData;

  return (
    <Box>
      {/* At-risk nudge */}
      {at_risk && (
        <Alert
          severity="warning"
          icon={<LocalFireDepartmentIcon />}
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Practice today to keep your {current_streak}-day streak alive!
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {/* Current streak */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocalFireDepartmentIcon sx={{ color: 'warning.main', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '1.75rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {current_streak}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              day streak
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ width: 1, height: 40, bgcolor: 'divider' }} />

        {/* Longest streak */}
        <Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '1.25rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {longest_streak}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            longest
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
