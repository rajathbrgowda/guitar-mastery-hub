import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

// CARD-310: About Developer copy
// CARD-311: AboutDeveloper component

const TAGS = ['Solo indie dev', 'Building in public', 'Open to feedback'];

export default function AboutDeveloper() {
  return (
    <Box
      id="about"
      sx={{ bgcolor: 'background.default', py: { xs: 8, sm: 12 } }}
      aria-labelledby="about-heading"
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
          About the Developer
        </Typography>

        <Typography
          id="about-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 2, letterSpacing: '-0.02em' }}
        >
          One person. One guitar app.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {TAGS.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            I am not a guitar teacher or a music platform. I am a developer who plays guitar badly
            and wanted a practice tracker that did not assume I had money to spend or hours to
            configure. I built this for myself, then made it public.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            This is a solo project. I ship it in the open, write about what I am building, and
            change things based on what users actually say. If something is broken or confusing, you
            can tell me. I will read it.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            The app is free. It will stay free. The only cost is your practice time — which you were
            going to spend anyway.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
