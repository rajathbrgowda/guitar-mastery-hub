import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import type { AnalyticsHistoryEntry } from '@gmh/shared/types/analytics';

interface ActivityHeatmapProps {
  data: AnalyticsHistoryEntry[]; // exactly 30 entries, oldest first
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box>
      {/* Day labels */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
        }}
      >
        {DAY_LABELS.map((label, i) => (
          <Typography
            key={i}
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.6rem', textAlign: 'center' }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {/* Grid of squares */}
      <Box
        data-testid="heatmap-grid"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}
      >
        {data.map((day) => {
          const intensity = Math.min(1, day.duration_min / 60);
          const opacity = day.duration_min === 0 ? 0.08 : Math.max(0.25, intensity);
          return (
            <Tooltip
              key={day.date}
              title={`${format(parseISO(day.date), 'EEE, MMM d')} · ${day.duration_min} min`}
              placement="top"
              arrow
            >
              <Box
                data-testid="heatmap-square"
                data-mins={day.duration_min}
                sx={{
                  aspectRatio: '1',
                  borderRadius: '3px',
                  bgcolor: alpha(primary, opacity),
                  cursor: 'default',
                  transition: 'opacity 0.15s',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
