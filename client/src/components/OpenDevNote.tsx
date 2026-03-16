import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// CARD-317: Open Dev Note copy — honest note from developer
// CARD-318: OpenDevNote component

export default function OpenDevNote() {
  return (
    <Box
      id="dev-note"
      sx={{ bgcolor: 'background.default', py: { xs: 4, md: 8 } }}
      aria-labelledby="dev-note-heading"
    >
      <Container maxWidth="sm">
        <Paper
          variant="outlined"
          sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, borderStyle: 'dashed' }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.12em',
              mb: 1.5,
              display: 'block',
            }}
          >
            A note from the developer
          </Typography>

          <Typography
            id="dev-note-heading"
            variant="h6"
            component="h2"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Early, honest, and in use
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Core features are live: session log, streak tracking, roadmap, mastery map, daily
              practice plan. I use it every day.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Not everything is polished. Some flows are rough. Better mobile, export, and streak
              sharing are next — just not done yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              If something feels broken or confusing — tell me. It gets fixed.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
