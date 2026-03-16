import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

const STEPS = [
  {
    number: '01',
    title: 'Log a session in 30 seconds',
    description: "Date, duration, how it felt. That's all. No templates, no forms, no friction.",
  },
  {
    number: '02',
    title: 'See your week at a glance',
    description:
      "Seven dots. Filled means you practiced. Empty means you didn't. No judgment, just data.",
  },
  {
    number: '03',
    title: 'Stop second-guessing your progress',
    description:
      "When someone asks how your guitar is going, you'll have an honest answer. 22 sessions logged. Bar chords took 4 weeks. That's progress.",
  },
];

export default function HowItWorks() {
  return (
    <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 8, fontWeight: 700 }}>
          How it works.
        </Typography>
        <Grid container spacing={6}>
          {STEPS.map((step) => (
            <Grid key={step.number} size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.3, lineHeight: 1, mb: 2 }}
              >
                {step.number}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                {step.title}
              </Typography>
              <Typography color="text.secondary">{step.description}</Typography>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 6 }}>
          <Button component={RouterLink} to="/demo" variant="outlined" size="large">
            See a full walkthrough →
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
