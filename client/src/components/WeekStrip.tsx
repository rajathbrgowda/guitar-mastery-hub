import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import { useTheme, alpha } from '@mui/material/styles';
import type { PracticeWeekDay } from '@gmh/shared/types';

function durationBucket(min: number): 'none' | 'light' | 'medium' | 'full' {
  if (min === 0) return 'none';
  if (min <= 15) return 'light';
  if (min <= 30) return 'medium';
  return 'full';
}

interface WeekStripProps {
  days: PracticeWeekDay[];
  todayStr: string;
  loading?: boolean;
}

export default function WeekStrip({ days, todayStr, loading = false }: WeekStripProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              flex: 1,
            }}
          >
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton width={20} height={12} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}>
      {days.map((day) => {
        const isToday = day.date === todayStr;
        const bucket = durationBucket(day.duration_min);
        const dotColor =
          bucket === 'none'
            ? theme.palette.divider
            : bucket === 'light'
              ? alpha(primary, 0.35)
              : bucket === 'medium'
                ? alpha(primary, 0.65)
                : primary;

        const tooltipLabel = day.has_session
          ? `${day.day_label} — ${day.duration_min} min`
          : `${day.day_label} — No session`;

        return (
          <Tooltip key={day.date} title={tooltipLabel} placement="top" arrow>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                flex: 1,
                cursor: 'default',
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  border: isToday ? `2px solid ${primary}` : '2px solid transparent',
                  transition: 'background-color 0.2s',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  color: isToday ? 'text.primary' : 'text.secondary',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day.day_label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
