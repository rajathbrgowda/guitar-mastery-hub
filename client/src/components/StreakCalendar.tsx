import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Realistic 3-week pattern: building momentum, current week is strongest
const PRACTICED: boolean[] = [
  false, true,  false, false, true,  false, false, // week 1 — casual start
  true,  false, true,  true,  false, true,  false, // week 2 — picking up
  true,  true,  true,  true,  true,  false, false, // week 3 — on a roll
];

export default function StreakCalendar() {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 5, mx: 'auto', maxWidth: 340 }}>
      {/* Day labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', mb: 1 }}>
        {DAY_LABELS.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            align="center"
            sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.6875rem' }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {PRACTICED.map((active, i) => (
          <Box
            key={i}
            sx={{
              height: 32,
              borderRadius: 1,
              bgcolor: active ? theme.palette.primary.main : 'rgba(255,255,255,0.07)',
              border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
              '@keyframes fadeInScale': {
                from: { opacity: 0, transform: 'scale(0.5)' },
                to:   { opacity: 1, transform: 'scale(1)' },
              },
              animation: 'fadeInScale 0.35s ease forwards',
              animationDelay: `${i * 45}ms`,
              opacity: 0,
              boxShadow: active ? `0 0 8px ${theme.palette.primary.main}55` : 'none',
            }}
          />
        ))}
      </Box>

      <Typography
        variant="caption"
        sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'rgba(255,255,255,0.35)', fontSize: '0.6875rem' }}
      >
        12 practice days in the last 3 weeks
      </Typography>
    </Box>
  );
}
