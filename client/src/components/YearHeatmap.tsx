import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import type { WeeklyHeatmapDay } from '@gmh/shared/types/analytics';

interface YearHeatmapProps {
  data: WeeklyHeatmapDay[]; // 364 entries
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function YearHeatmap({ data }: YearHeatmapProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  // Group by week (52 columns × 7 rows)
  const weeks: WeeklyHeatmapDay[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(data.filter((d) => d.week === w));
  }

  // Month label positions — find first day of each month in data
  const monthPositions: { label: string; week: number }[] = [];
  let lastMonth = -1;
  for (const day of data) {
    const m = parseISO(day.date).getMonth();
    if (m !== lastMonth) {
      monthPositions.push({ label: MONTH_LABELS[m], week: day.week });
      lastMonth = m;
    }
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      {/* Month labels row */}
      <Box sx={{ display: 'flex', ml: '24px', mb: 0.5, position: 'relative', height: 16 }}>
        {monthPositions.map(({ label, week }) => (
          <Typography
            key={label + week}
            variant="caption"
            color="text.secondary"
            sx={{ position: 'absolute', left: `${(week / 52) * 100}%`, fontSize: '0.6rem' }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: '2px' }}>
        {/* Day-of-week labels */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', mr: 0.5 }}>
          {DAY_LABELS.map((label, i) => (
            <Typography
              key={i}
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.55rem',
                height: 10,
                lineHeight: '10px',
                width: 20,
                textAlign: 'right',
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* 52 week columns */}
        {weeks.map((week, wi) => (
          <Box key={wi} sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Array.from({ length: 7 }, (_, dow) => {
              const day = week.find((d) => d.day_of_week === dow);
              const mins = day?.duration_min ?? 0;
              const opacity = mins === 0 ? 0.07 : Math.min(1, 0.2 + (mins / 60) * 0.8);
              return (
                <Tooltip
                  key={dow}
                  title={day ? `${format(parseISO(day.date), 'EEE, MMM d')} · ${mins} min` : ''}
                  placement="top"
                  arrow
                >
                  <Box
                    data-testid="heatmap-cell"
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '2px',
                      bgcolor: alpha(primary, opacity),
                      cursor: 'default',
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
