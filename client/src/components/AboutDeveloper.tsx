import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

// CARD-310: About Developer copy
// CARD-311: AboutDeveloper component

const TAGS = ['Made with care', 'Free forever', 'Shaped by feedback'];

export default function AboutDeveloper() {
  return (
    <Box
      id="about"
      sx={{ bgcolor: 'background.default', py: { xs: 5, md: 10 } }}
      aria-labelledby="about-heading"
    >
      <Container maxWidth="sm">
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: '0.12em',
            mb: 1,
            display: 'block',
          }}
        >
          Behind the app
        </Typography>

        <Typography
          id="about-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 2, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        >
          Small, careful, free.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {TAGS.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            The gap was there. This fills it. No subscriptions, no configuration. Just a place to
            put your practice.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            If something feels off, say so. There is a real person reading it.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            The app is free. It will stay free. The only cost is your practice time — which you were
            going to spend anyway.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
