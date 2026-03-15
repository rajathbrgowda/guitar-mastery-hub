import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// CARD-308: Why I Built This copy
// CARD-309: WhyIBuiltThis component

const COPY = {
  label: 'Why I Built This',
  heading: 'I was the guitarist who kept quitting.',
  paragraphs: [
    'Every app I tried was either a metronome or a subscription wall asking for £9.99 before I had logged a single session. I wanted something honest: show me what I actually practiced, remind me when my streak was at risk, and give me a structured path instead of a random playlist.',
    'I follow JustinGuitar. The curriculum is free and genuinely brilliant. But there was no practice tracker built around it. No way to say "I worked on barre chords for 20 minutes on Tuesday and I can see that I have done it 12 times this month." No mastery map. No streaks without a paywall.',
    'So I built one. No subscription. No premium tier. No dark patterns. Just a clean tracker that respects your time and tells you the truth about your progress — even when that truth is that you skipped three days.',
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
