import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function TheProblem() {
  return (
    <Box id="the-problem" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#1c1917' }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 5, fontWeight: 700, color: 'white' }}>
          The problem.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          You open JustinGuitar after a three-week gap. The lesson is right where you left it. But
          you have no idea how much you actually practiced before that gap. Or which skills felt
          solid. Or which ones you avoided because they were hard.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          The lesson app doesn&apos;t know either. It just holds your place.
        </Typography>
        <Typography sx={{ mb: 3, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          That&apos;s fine. That&apos;s its job. But it means you&apos;re always starting from
          feelings, not facts. &quot;I think I practiced a lot last month.&quot; &quot;I feel like
          bar chords are getting better.&quot; &quot;I probably should have done more scales.&quot;
        </Typography>
        <Typography
          sx={{ mb: 3, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.8 }}
        >
          Probably. Think. Feel. Should have.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          You don&apos;t need a lesson plan. You need a record. Not a detailed one. Just: what you
          did, how long, and whether it felt hard or easy. That&apos;s it. That&apos;s the whole
          gap.
        </Typography>
      </Container>
    </Box>
  );
}
