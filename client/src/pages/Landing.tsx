import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { RoomScene } from '../components/RoomScene';
import { ROOM_SCENE_ENABLED } from '../lib/featureFlags';
import HowItWorks from '../components/landing/HowItWorks';
import TypicalTuesday from '../components/landing/TypicalTuesday';
import IsThisForYou from '../components/landing/IsThisForYou';
import TheProblem from '../components/landing/TheProblem';
import WeekStripMockup from '../components/landing/WeekStripMockup';
import WhyIBuiltThis from '../components/WhyIBuiltThis';
import AboutDeveloper from '../components/AboutDeveloper';
import FAQSection from '../components/FAQSection';
import TestimonialSection from '../components/TestimonialSection';
import OpenDevNote from '../components/OpenDevNote';
import CloseCTA from '../components/CloseCTA';

// ── Shared fade-in animation ──────────────────────────────────────────────────

const fadeInUp = {
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  animation: 'fadeInUp 0.5s ease forwards',
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const theme = useTheme();
  const hour = new Date().getHours();
  const lampOn = theme.palette.mode === 'dark' || hour < 7 || hour >= 20;

  if (!loading && session) return <Navigate to="/app" replace />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <Box
        component="nav"
        aria-label="Site navigation"
        sx={{
          px: { xs: 2, sm: 6 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.default',
          zIndex: 10,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary" component="span">
          Guitar Mastery Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button component="a" href="#who-its-for" color="inherit" size="small">
            About
          </Button>
          <Button variant="text" size="small" color="inherit" onClick={() => navigate('/demo')}>
            Demo
          </Button>
          <DarkModeToggle />
          <Button variant="text" color="inherit" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button variant="contained" onClick={() => navigate('/login?mode=signup')}>
            Sign up free
          </Button>
        </Box>
      </Box>

      {/* ── Dark hero ────────────────────────────────────────────────────────── */}
      <Box
        id="hero"
        component="section"
        aria-labelledby="hero-heading"
        sx={{ bgcolor: '#1c1917', py: { xs: 8, md: 14 }, overflow: 'hidden' }}
      >
        <Container maxWidth="lg" sx={{ ...fadeInUp }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 6 } }}>
            {/* Left: text + CTA */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Chip
                label="Built for JustinGuitar learners"
                size="small"
                variant="outlined"
                sx={{
                  mb: 3,
                  color: '#fbbf24',
                  borderColor: '#78350f',
                  bgcolor: '#1c110a',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />

              <Typography
                id="hero-heading"
                variant="h1"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: '#ffffff',
                  mb: 2.5,
                }}
              >
                Stop starting over.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  mb: 4,
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  lineHeight: 1.65,
                }}
              >
                A practice tracker for guitarists working through JustinGuitar Grades 1–3. Log
                sessions, see streaks, stay honest.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/login?mode=signup"
                  sx={{ px: 4, py: 1.25, fontSize: '1rem', fontWeight: 600 }}
                  aria-label="Start free — sign up"
                >
                  Start free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component="a"
                  href="#how-it-works"
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.6)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                  aria-label="See how it works"
                >
                  See how it works
                </Button>
              </Box>

              <Box
                sx={{ mt: 4, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                <WeekStripMockup />
              </Box>
            </Box>

            {/* Right: room scene — desktop only */}
            {ROOM_SCENE_ENABLED && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: '46%',
                  flexShrink: 0,
                  borderRadius: 3,
                  overflow: 'hidden',
                  opacity: 0.92,
                }}
              >
                <RoomScene lampOn={lampOn} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── IsThisForYou ─────────────────────────────────────────────────────── */}
      <IsThisForYou />

      {/* ── TheProblem ───────────────────────────────────────────────────────── */}
      <TheProblem />

      {/* ── HowItWorks ───────────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── TypicalTuesday ───────────────────────────────────────────────────── */}
      <TypicalTuesday />

      {/* ── Testimonials (redesigned) ─────────────────────────────────────────── */}
      <TestimonialSection />

      {/* ── Why I Built This ─────────────────────────────────────────────────── */}
      <WhyIBuiltThis />

      {/* ── About Developer ──────────────────────────────────────────────────── */}
      <AboutDeveloper />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Open Dev Note ────────────────────────────────────────────────────── */}
      <OpenDevNote />

      {/* ── Close CTA (replaces old final CTA) ───────────────────────────────── */}
      <CloseCTA />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 4,
          px: { xs: 2, sm: 6 },
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="body2" fontWeight={600}>
              Built by one person.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © 2026 Guitar Mastery Hub
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
          >
            <Button component="a" href="#who-its-for" size="small" color="inherit">
              About
            </Button>
            <Button component={RouterLink} to="/demo" size="small" color="inherit">
              Demo
            </Button>
            <Button
              component="a"
              href="https://github.com/rajathbrgowda/guitar-mastery-hub"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              color="inherit"
            >
              GitHub
            </Button>
            <Button component={RouterLink} to="/privacy" size="small" color="inherit">
              Privacy
            </Button>
            <Button component={RouterLink} to="/terms" size="small" color="inherit">
              Terms
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
