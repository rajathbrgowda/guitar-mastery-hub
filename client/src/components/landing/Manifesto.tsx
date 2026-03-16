import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const STATEMENTS = [
  'This is not a lesson app. Your lessons are elsewhere — YouTube, JustinGuitar, Marty Music, wherever. This just keeps score.',
  "This is not a streak app. The streak breaks. Life happens. That's fine.",
  'This is not a social app. Your practice is not a performance.',
  'This is not a gamification experiment. There are no badges, no leaderboards, no dopamine traps.',
  'This is a log. Honest data. Yours.',
];

export default function Manifesto() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#1c1917',
        color: 'common.white',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="overline"
          sx={{ color: 'rgba(255,255,255,0.4)', mb: 3, display: 'block', letterSpacing: '0.15em' }}
        >
          What this is not
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 6, color: 'common.white', lineHeight: 1.2 }}
        >
          Five honest things.
        </Typography>
        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {STATEMENTS.map((statement, i) => (
            <Box key={i} component="li">
              <Box sx={{ display: 'flex', gap: 3, py: 3, alignItems: 'flex-start' }}>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    color: 'rgba(234,88,12,0.5)',
                    lineHeight: 1.3,
                    minWidth: 32,
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </Typography>
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontSize: '1.05rem' }}
                >
                  {statement}
                </Typography>
              </Box>
              {i < STATEMENTS.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
