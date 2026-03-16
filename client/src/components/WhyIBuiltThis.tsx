import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// CARD-308: Why I Built This copy
// CARD-309: WhyIBuiltThis component

const COPY = {
  label: 'The thinking behind it',
  heading: 'For the guitarist who keeps picking it back up.',
  paragraphs: [
    'Most practice apps are either a metronome or a paywall. Neither one tells you what you have actually been working on.',
    "JustinGuitar's lessons are free and genuinely good. What was missing was something to track the slow, unglamorous work between lessons — the barre chords you have run twelve times this month, the streak you broke on Tuesday, the progress that is real even when it does not feel like it.",
    'So this exists. No subscription, no dark patterns. Just a quiet, honest record of the practice you show up for — and the days you do not.',
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
