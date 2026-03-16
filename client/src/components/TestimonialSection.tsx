import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// CARD-315: Rewrite testimonial copy — more authentic, specific
// CARD-316: Redesign TestimonialSection component

const TESTIMONIALS = [
  {
    quote:
      'I kept telling myself I was practicing. Then I looked at the log and realised I had skipped 11 days in a row without noticing. Seeing it in black and white made me actually show up.',
    name: 'Priya S.',
    context: '2 months in',
  },
  {
    quote:
      'The streak calendar is the only feature I use every single day. It is small and dumb but it works. I have not broken a 40-day streak and I am not about to start.',
    name: 'Marcus W.',
    context: '5 months in — just hit Beginner phase',
  },
  {
    quote:
      'I tried three practice apps before this one. They all wanted me to pay before I had logged anything. This one just let me start.',
    name: 'Aoife D.',
    context: 'Foundation phase — 6 weeks logged',
  },
];

export default function TestimonialSection() {
  return (
    <Box
      id="testimonials"
      sx={{ bgcolor: '#1c1917', py: { xs: 8, sm: 12 } }}
      aria-labelledby="testimonials-heading"
    >
      <Container maxWidth="md">
        <Typography
          id="testimonials-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{
            color: '#ffffff',
            mb: 6,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          From people actually using it
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 3, sm: 3 },
          }}
        >
          {TESTIMONIALS.map((t) => (
            <Paper
              key={t.name}
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  mb: 2.5,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </Typography>
              <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                {t.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.35)', display: 'block', mt: 0.25 }}
              >
                {t.context}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
