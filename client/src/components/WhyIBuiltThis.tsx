import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const COPY = {
  label: 'Why this exists',
  heading: 'You know that feeling of picking it up after three weeks?',
  paragraphs: [
    'Most apps give you lessons or a metronome. Neither one remembers what you have been working on.',
    'The lessons are out there — JustinGuitar, Marty, wherever you learn. There was nothing keeping track of the slow work between them. The barre chords you have done twelve times. The streak you broke on Tuesday. The progress that is real even when it does not feel like it.',
    'Free, quiet, no noise. A record of the days you showed up — and the ones you did not.',
  ],
};

export default function WhyIBuiltThis() {
  return (
    <Box
      id="the-thinking"
      sx={{ bgcolor: 'background.paper', py: { xs: 5, md: 10 } }}
      aria-labelledby="why-heading"
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
          {COPY.label}
        </Typography>

        <Typography
          id="why-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 3, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        >
          {COPY.heading}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COPY.paragraphs.map((p, i) => (
            <Typography key={i} variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
              {p}
            </Typography>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
