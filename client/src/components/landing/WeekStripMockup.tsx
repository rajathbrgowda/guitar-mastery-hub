import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FILLED = [true, true, true, true, true, false, false];

export default function WeekStripMockup() {
  return (
    <Paper
      elevation={2}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.06)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
        {FILLED.map((filled, i) => (
          <Box
            key={i}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: filled ? 'primary.main' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {DAYS.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              width: 28,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.65rem',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
