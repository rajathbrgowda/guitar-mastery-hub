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
import {
  ROOM_SCENE_ENABLED,
  TYPICAL_TUESDAY_ENABLED,
  BEFORE_AFTER_ENABLED,
  TESTIMONIALS_ENABLED,
} from '../lib/featureFlags';
import HowItWorks from '../components/landing/HowItWorks';
import TypicalTuesday from '../components/landing/TypicalTuesday';
import BeforeAfter from '../components/landing/BeforeAfter';
import Manifesto from '../components/landing/Manifesto';
import IsThisForYou from '../components/landing/IsThisForYou';
import TheProblem from '../components/landing/TheProblem';
import WeekStripMockup from '../components/landing/WeekStripMockup';
import WhyIBuiltThis from '../components/WhyIBuiltThis';
import AboutDeveloper from '../components/AboutDeveloper';
import FAQSection from '../components/FAQSection';
import TestimonialSection from '../components/TestimonialSection';
import OpenDevNote from '../components/OpenDevNote';
import CloseCTA from '../components/CloseCTA';
import WaveBackground from '../components/WaveBackground';
import { WAVE_BACKGROUND_ENABLED } from '../lib/featureFlags';

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      {WAVE_BACKGROUND_ENABLED && <WaveBackground variant="hero" />}

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
          bgcolor: WAVE_BACKGROUND_ENABLED ? 'transparent' : 'background.default',
          backdropFilter: WAVE_BACKGROUND_ENABLED ? 'blur(12px)' : undefined,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary" component="span">
          Fretwork
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1.5 }, alignItems: 'center' }}>
          <Button
            component="a"
            href="#who-its-for"
            color="inherit"
            size="small"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            About
          </Button>
          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={() => navigate('/demo')}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Demo
          </Button>
          <DarkModeToggle />
          <Button variant="text" size="small" color="inherit" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button variant="contained" size="small" onClick={() => navigate('/login?mode=signup')}>
            Sign up
          </Button>
        </Box>
      </Box>

      {/* ── Dark hero ────────────────────────────────────────────────────────── */}
      <Box
        id="hero"
        component="section"
        aria-labelledby="hero-heading"
        sx={{ bgcolor: '#1c1917', py: { xs: 5, md: 14 }, overflow: 'hidden' }}
      >
        <Container maxWidth="lg" sx={{ ...fadeInUp }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 6 } }}>
            {/* Left: text + CTA */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Chip
                label="For the guitarist who keeps starting over"
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
                15 minutes logged. A chord finally clicked. That's worth knowing.
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
                  sx={{ px: { xs: 2.5, sm: 4 }, py: 1.25, fontSize: '1rem', fontWeight: 600 }}
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
                    px: { xs: 2.5, sm: 4 },
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
      {TYPICAL_TUESDAY_ENABLED && <TypicalTuesday />}

      {/* ── BeforeAfter ──────────────────────────────────────────────────────── */}
      {BEFORE_AFTER_ENABLED && <BeforeAfter />}

      {/* ── Manifesto ────────────────────────────────────────────────────────── */}
      <Manifesto />

      {/* ── Testimonials (redesigned) ─────────────────────────────────────────── */}
      {TESTIMONIALS_ENABLED && <TestimonialSection />}

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
              Made with care.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © 2026 Fretwork
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
