import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StreakCalendar from '../components/StreakCalendar';
import WhyIBuiltThis from '../components/WhyIBuiltThis';
import AboutDeveloper from '../components/AboutDeveloper';
import FAQSection from '../components/FAQSection';
import TestimonialSection from '../components/TestimonialSection';
import OpenDevNote from '../components/OpenDevNote';
import CloseCTA from '../components/CloseCTA';

// ── Static data ────────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  {
    date: 'Mon, Mar 10',
    duration: 25,
    notes: 'Nailed the F chord transition finally.',
    sections: ['Warm-up', 'Chords', 'Song'],
  },
  {
    date: 'Tue, Mar 11',
    duration: 18,
    notes: 'Focused on fingerpicking patterns.',
    sections: ['Scales', 'Fingerpicking'],
  },
  {
    date: 'Wed, Mar 12',
    duration: 32,
    notes: 'Long session — worked through JG Grade 1 review.',
    sections: ['Warm-up', 'Chords', 'Theory', 'Song'],
  },
  {
    date: 'Thu, Mar 13',
    duration: 20,
    notes: 'Slow practice on chord changes. Feeling smoother.',
    sections: ['Chords', 'Song'],
  },
];

const BPM_DATA = [
  { week: 'Wk 1', bpm: 58 },
  { week: 'Wk 2', bpm: 62 },
  { week: 'Wk 3', bpm: 67 },
  { week: 'Wk 4', bpm: 74 },
  { week: 'Wk 5', bpm: 84 },
  { week: 'Wk 6', bpm: 96 },
];

const PHASES = [
  { label: 'Foundation', desc: 'Open chords, strumming, first songs' },
  { label: 'Beginner', desc: 'Barre chords, music theory basics' },
  { label: 'Intermediate', desc: 'Scales, solos, ear training' },
  { label: 'Advanced', desc: 'Improvisation, modes, songwriting' },
  { label: 'Mastery', desc: 'Style refinement, professional playing' },
];

// ── Shared fade-in animation ──────────────────────────────────────────────────

const fadeInUp = {
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  animation: 'fadeInUp 0.5s ease forwards',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
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
      {children}
    </Typography>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

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
        component="section"
        aria-labelledby="hero-heading"
        sx={{ bgcolor: '#1c1917', pt: { xs: 8, sm: 12 }, pb: { xs: 8, sm: 12 } }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center', ...fadeInUp }}>
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
              fontSize: { xs: '2.25rem', sm: '3rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#ffffff',
              mb: 2.5,
            }}
          >
            Finally stick{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              with guitar.
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, fontSize: '1.0625rem', lineHeight: 1.65 }}
          >
            Structured practice. Real data. No noise.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login?mode=signup')}
              sx={{ px: 4, py: 1.25, fontSize: '1rem', fontWeight: 600 }}
              aria-label="Get started free — sign up"
            >
              Get started free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/demo')}
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
              aria-label="See how it works — demo"
            >
              See how it works
            </Button>
          </Box>

          <StreakCalendar />
        </Container>
      </Box>

      {/* ── Section 1: What a week looks like ───────────────────────────────── */}
      <Box
        component="section"
        id="features"
        aria-labelledby="section-session-log"
        sx={{ bgcolor: 'background.default', py: { xs: 8, sm: 12 } }}
      >
        <Container maxWidth="sm">
          <SectionLabel>Session Log</SectionLabel>
          <Typography
            id="section-session-log"
            variant="h2"
            fontWeight={700}
            sx={{ mb: 1.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            What a week looks like
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Log every session in seconds. See exactly how your time is spent.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MOCK_SESSIONS.map((s) => (
              <Paper key={s.date} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {s.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.duration} min
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                  {s.sections.map((sec) => (
                    <Chip
                      key={sec}
                      label={sec}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {s.notes}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Section 2: See yourself improve ─────────────────────────────────── */}
      <Box
        component="section"
        aria-labelledby="section-analytics"
        sx={{ bgcolor: 'background.paper', py: { xs: 8, sm: 12 } }}
      >
        <Container maxWidth="sm">
          <SectionLabel>Analytics</SectionLabel>
          <Typography
            id="section-analytics"
            variant="h2"
            fontWeight={700}
            sx={{ mb: 1.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            See yourself improve
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Watch your speed, consistency, and confidence grow week over week.
          </Typography>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: 'block', mb: 2 }}
            >
              Target BPM — Major scale (6-week trend)
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 120 }}
              role="img"
              aria-label="Bar chart showing BPM improvement from 58 to 96 over 6 weeks"
            >
              {BPM_DATA.map((d, i) => (
                <Box
                  key={d.week}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {d.bpm}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: '3px 3px 0 0',
                      height: `${(d.bpm / 100) * 90}px`,
                      opacity: 0.5 + (i / BPM_DATA.length) * 0.5,
                      '@keyframes growUp': {
                        from: { transform: 'scaleY(0)', transformOrigin: 'bottom' },
                        to: { transform: 'scaleY(1)', transformOrigin: 'bottom' },
                      },
                      animation: 'growUp 0.5s ease forwards',
                      animationDelay: `${i * 80}ms`,
                      transform: 'scaleY(0)',
                      transformOrigin: 'bottom',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {d.week}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ── Section 3: A path, not a playlist ───────────────────────────────── */}
      <Box
        component="section"
        aria-labelledby="section-roadmap"
        sx={{ bgcolor: 'background.default', py: { xs: 8, sm: 12 } }}
      >
        <Container maxWidth="sm">
          <SectionLabel>Roadmap</SectionLabel>
          <Typography
            id="section-roadmap"
            variant="h2"
            fontWeight={700}
            sx={{ mb: 1.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            A path, not a playlist
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Five structured phases from your first chord to confident playing. Always know what's
            next.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {PHASES.map((phase, i) => (
              <Box
                key={phase.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: i === 1 ? 'primary.main' : 'divider',
                  bgcolor: i === 1 ? 'primary.main' : 'transparent',
                  color: i === 1 ? 'primary.contrastText' : 'inherit',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: i === 1 ? 'rgba(255,255,255,0.2)' : 'background.paper',
                    border: '1px solid',
                    borderColor: i === 1 ? 'rgba(255,255,255,0.3)' : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: i === 1 ? 'inherit' : 'text.secondary' }}
                  >
                    {i + 1}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {phase.label}
                    {i === 1 && (
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          fontSize: '0.65rem',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.75,
                          fontWeight: 600,
                          verticalAlign: 'middle',
                        }}
                      >
                        Current
                      </Box>
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: i === 1 ? 0.8 : 1,
                      color: i === 1 ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {phase.desc}
                  </Typography>
                </Box>
                {i < PHASES.length - 1 && (
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      left: 28,
                      bottom: -13,
                      width: 1,
                      height: 12,
                      bgcolor: 'divider',
                      zIndex: 1,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

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
