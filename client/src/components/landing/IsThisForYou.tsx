import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const FOR_YOU = [
  "You're working through JustinGuitar Grades 1, 2, or 3",
  "You've restarted guitar at least once",
  "You practice, but you're not sure if you're actually improving",
  'You want a log, not another lesson app',
  'You practice in short sessions — 15 to 30 minutes at a time',
];

const NOT_FOR_YOU = [
  "You're looking for lessons or chord tutorials",
  'You play classical or fingerstyle and need a different structure',
  'You want gamification, streaks with rewards, or social features',
  "You're already an advanced player who has their practice sorted",
];

export default function IsThisForYou() {
  return (
    <Box id="who-its-for" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 6, fontWeight: 700 }}>
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
