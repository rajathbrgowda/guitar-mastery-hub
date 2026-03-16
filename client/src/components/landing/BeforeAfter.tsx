import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const CONTRASTS = [
  {
    before: 'You practice for 20 minutes but have no idea if that was good or bad.',
    after: 'You log it. 20 minutes, felt solid. The data tells you — 14 sessions this month.',
  },
  {
    before: 'A friend asks how your guitar is going. You say "yeah, okay I guess."',
    after:
      'You say: "22 sessions since January. Bar chords finally clicked in week 4." That\'s real.',
  },
  {
    before: "You quit because you can't tell if you're making progress.",
    after: "You keep going because the streak is honest. The record doesn't lie.",
  },
];

export default function BeforeAfter() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          The difference is the record.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 8, maxWidth: 560 }}>
          Same guitarist. Same amount of practice. One has a log.
        </Typography>

        {CONTRASTS.map((item, i) => (
          <Grid
            key={i}
            container
            spacing={0}
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  height: '100%',
                  borderRight: { sm: '1px solid' },
                  borderColor: { sm: 'divider' },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: 'text.disabled', mb: 1, display: 'block' }}
                >
                  Without a log
                </Typography>
                <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.7 }}>
                  {item.before}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 3, height: '100%' }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'primary.main', mb: 1, display: 'block' }}
                >
                  With a log
                </Typography>
                <Typography sx={{ lineHeight: 1.7 }}>{item.after}</Typography>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Container>
    </Box>
  );
}
