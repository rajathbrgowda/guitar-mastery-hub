import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function TypicalTuesday() {
  return (
    <Box id="a-tuesday" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 6, fontWeight: 700 }}>
          A typical Tuesday.
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={0}
              sx={{ p: 4, bgcolor: 'action.hover', borderRadius: 2, height: '100%' }}
            >
              <Typography
                variant="overline"
                sx={{ color: 'text.disabled', mb: 2, display: 'block' }}
              >
                Before
              </Typography>
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.8 }}>
                It&apos;s 10pm on a Tuesday. You had 15 minutes to practice, but the day got away
                from you. &quot;I&apos;ll do it tomorrow,&quot; you think. Tomorrow is also a
                Tuesday, somewhere.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: 'rgba(234, 88, 12, 0.08)',
                borderRadius: 2,
                height: '100%',
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', mb: 2, display: 'block' }}
              >
                After
              </Typography>
              <Typography sx={{ lineHeight: 1.8 }}>
                It&apos;s 10pm on a Tuesday. You sit down. 15 minutes. You run through the chord
                transitions you&apos;ve been avoiding. You log it. The streak holds. The record is
                honest. That&apos;s the whole goal.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
