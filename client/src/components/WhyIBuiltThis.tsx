import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// CARD-308: Why I Built This copy
// CARD-309: WhyIBuiltThis component

const COPY = {
  label: 'Why I Built This',
  heading: 'I was the guitarist who kept quitting.',
  paragraphs: [
    "Every app I tried was either a metronome or a £9.99 subscription wall. I just wanted to see what I'd actually practiced.",
    'I follow an online guitar curriculum — JustinGuitar. The lessons are free and genuinely good. But there was no simple practice tracker built for people like me — no mastery map, no honest streak, nothing that said "you\'ve done barre chords 12 times this month."',
    'So I built one. No subscription, no dark patterns. Just a tracker that tells you the truth — including when that truth is you skipped three days.',
  ],
};

export default function WhyIBuiltThis() {
  return (
    <Box
      id="why-i-built-this"
      sx={{ bgcolor: 'background.paper', py: { xs: 8, sm: 12 } }}
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
          sx={{ mb: 3, letterSpacing: '-0.02em' }}
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
