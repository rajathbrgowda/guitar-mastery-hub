import { Box, Tooltip, Typography } from '@mui/material';
import type { AnalyticsDay } from '@gmh/shared/types/analytics';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function intensityColor(minutes: number): string {
  if (minutes === 0) return 'transparent';
  if (minutes < 10) return 'rgba(var(--mui-palette-primary-mainChannel) / 0.25)';
  if (minutes < 20) return 'rgba(var(--mui-palette-primary-mainChannel) / 0.5)';
  if (minutes < 30) return 'rgba(var(--mui-palette-primary-mainChannel) / 0.75)';
  return 'var(--mui-palette-primary-main)';
}

interface WeekCalendarProps {
  last7: AnalyticsDay[];
}

export function WeekCalendar({ last7 }: WeekCalendarProps) {
  const weekDates = getWeekDates();
  const today = new Date().toISOString().slice(0, 10);

  const minutesByDate = new Map(last7.map((d) => [d.date, d.duration_min]));

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mb: 0.75,
          display: 'block',
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontSize: '0.6rem',
        }}
      >
        This week
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        {weekDates.map((date, idx) => {
          const mins = minutesByDate.get(date) ?? 0;
          const isToday = date === today;
          const isFuture = date > today;
          const hasPracticed = mins > 0;

          return (
            <Tooltip
              key={date}
              title={
                isFuture
                  ? DAY_LABELS[idx]
                  : hasPracticed
                    ? `${DAY_LABELS[idx]}: ${mins} min`
                    : `${DAY_LABELS[idx]}: no practice`
              }
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 1,
                    bgcolor: isFuture
                      ? 'action.hover'
                      : hasPracticed
                        ? intensityColor(mins)
                        : 'action.selected',
                    border: isToday ? 2 : 1,
                    borderColor: isToday ? 'primary.main' : 'divider',
                    transition: 'background-color 0.2s',
                    cursor: 'default',
                    minWidth: 24,
                    maxWidth: 40,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.55rem',
                    color: isToday ? 'primary.main' : 'text.disabled',
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {DAY_LABELS[idx].slice(0, 1)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
