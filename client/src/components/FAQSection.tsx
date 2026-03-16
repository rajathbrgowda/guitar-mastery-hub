import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// CARD-312: FAQ copy — 7 honest Q&A pairs
// CARD-313: FAQ accordion component
// CARD-314: Mobile layout for FAQ

const FAQ_ITEMS = [
  {
    q: 'Is it really free?',
    a: 'Yes. No credit card, no trial period, no premium tier. I built this to use myself and it costs me almost nothing to run. There are no plans to charge for it.',
  },
  {
    q: 'Does it work with any guitar curriculum?',
    a: 'Yes. You can choose from JustinGuitar, Marty Music, Andy Guitar, or a general path in Settings. Each curriculum has its own skill map, and your progress is tracked independently per curriculum. You can switch anytime without losing data.',
  },
  {
    q: 'I already practice regularly. Why would I log sessions?',
    a: 'Because memory lies. You think you practiced bar chords a lot last month. The log will show you 3 sessions in 6 weeks. That gap is where progress stalls. Logging takes 30 seconds and gives you an honest record.',
  },
  {
    q: 'Will my data be safe if you shut this down?',
    a: 'Your data lives in a Supabase database. If I ever shut the app down I will give at least 30 days notice and provide a CSV export. The code is on GitHub — you could self-host it.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The app is designed mobile-first. Logging a session from your phone takes a few taps. Everything is responsive.',
  },
  {
    q: 'What is the mastery map?',
    a: 'It is a visual overview of every skill in your curriculum — not started, learning, mastered, or rusty. A skill goes rusty if you have not practiced it in 21 days. It is a quick way to see what needs attention without digging through session logs.',
  },
];

export default function FAQSection() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id="faq"
      sx={{ bgcolor: 'background.paper', py: { xs: 5, md: 10 } }}
      aria-labelledby="faq-heading"
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
          FAQ
        </Typography>

        <Typography
          id="faq-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 4, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        >
          Honest answers
        </Typography>

        <Box>
          {FAQ_ITEMS.map((item, i) => {
            const panel = `panel-${i}`;
            return (
              <Accordion
                key={panel}
                expanded={expanded === panel}
                onChange={handleChange(panel)}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:not(:last-child)': { borderBottom: 0 },
                  '&:first-of-type': { borderRadius: '8px 8px 0 0' },
                  '&:last-of-type': { borderRadius: '0 0 8px 8px' },
                  '&:only-of-type': { borderRadius: 2 },
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${panel}-content`}
                  id={`${panel}-header`}
                  sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}
                >
                  <Typography variant="body1" fontWeight={600} sx={{ pr: 2 }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
