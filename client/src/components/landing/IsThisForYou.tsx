import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const FOR_YOU = [
  'You follow a structured curriculum — JustinGuitar, Marty Music, Andy Guitar, or your own path',
  "You've restarted guitar at least once (or three times)",
  "You practice, but you're not sure if you're actually improving",
  'You want a practice log, not another lesson app',
  'You learn in short sessions — 15 to 30 minutes at a time',
];

const NOT_FOR_YOU = [
  "You're looking for lessons, chord tutorials, or structured courses",
  'You want gamification, streaks with rewards, or social features',
  'You want theory tracking or sheet music tools',
  "You're already consistent and just want a metronome",
];

export default function IsThisForYou() {
  return (
    <Box id="who-its-for" sx={{ py: { xs: 5, md: 10 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ mb: 6, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        >
          Is this for you?
        </Typography>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'success.main' }}>
              For you
            </Typography>
            {FOR_YOU.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                <CheckCircleIcon sx={{ color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                <Typography>{item}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
              Probably not
            </Typography>
            {NOT_FOR_YOU.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                <CancelIcon sx={{ color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
                <Typography color="text.secondary">{item}</Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
