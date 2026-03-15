import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

interface SkillBreakdownChartProps {
  byCategory: Record<string, number>; // category → total mins
}

export function SkillBreakdownChart({ byCategory }: SkillBreakdownChartProps) {
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxVal = entries[0]?.[1] ?? 1;

  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No practice data yet
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {entries.map(([cat, mins]) => (
        <Box key={cat}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'capitalize', fontWeight: 500 }}
            >
              {cat}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}
            >
              {mins} min
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(mins / maxVal) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': { borderRadius: 3 },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
