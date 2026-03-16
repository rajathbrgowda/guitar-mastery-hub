import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function TheProblem() {
  return (
    <Box id="the-problem" sx={{ py: { xs: 5, md: 10 }, bgcolor: '#1c1917' }}>
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          sx={{
            mb: 5,
            fontWeight: 700,
            color: 'white',
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
          }}
        >
          The problem.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          You open your lesson app after three weeks away. Lesson&apos;s right where you left it.
          But you have no idea what you practiced, what felt solid, or what you dodged.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          The lesson app doesn&apos;t know either. It just holds your place.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          So you&apos;re always working from feelings. &quot;I think I practiced a lot.&quot;
          &quot;Bar chords are probably getting better.&quot; &quot;I should have done more
          scales.&quot;
        </Typography>
        <Typography
          sx={{ mb: 3, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.8 }}
        >
          Probably. Think. Should have.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          You don&apos;t need a lesson plan. Just a record. What you did, how long, hard or easy.
          That&apos;s the whole gap.
        </Typography>
      </Container>
    </Box>
  );
}
