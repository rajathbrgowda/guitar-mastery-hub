import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

const features = [
  {
    icon: <TimerOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
    title: 'Practice Timer',
    desc: 'Log every session with a built-in timer. Break sessions into sections — warm up, scales, songs.',
  },
  {
    icon: <MapOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
    title: '5-Phase Roadmap',
    desc: 'Structured curriculum from total beginner to confident player. Know exactly what to practice next.',
  },
  {
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
    title: 'Skill Tree',
    desc: 'Check off skills as you master them. See your progress visually across every phase.',
  },
  {
    icon: <BarChartOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
    title: 'Analytics',
    desc: 'Track streaks, total minutes, and trends over time. Stay consistent with data.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  if (!loading && session) return <Navigate to="/app" replace />;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Nav */}
      <Box
        component="nav"
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
        <Typography variant="h6" fontWeight={700} color="primary">
          Guitar Mastery Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="text" color="inherit" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button variant="contained" onClick={() => navigate('/login?mode=signup')}>
            Sign up free
          </Button>
        </Box>
      </Box>

      {/* Hero */}
      <Container maxWidth="md" sx={{ pt: { xs: 8, sm: 12 }, pb: 8, textAlign: 'center' }}>
        <Chip
          label="Built for JustinGuitar learners"
          size="small"
          variant="outlined"
          sx={{ mb: 3, bgcolor: '#fef3ee', color: 'primary.main', borderColor: '#fde8d8', fontWeight: 500 }}
        />
        <Typography
          variant="h2"
          fontWeight={700}
          sx={{ fontSize: { xs: '2rem', sm: '2.75rem' }, letterSpacing: '-0.02em', mb: 2 }}
        >
          Track your practice.
          <br />
          <Box component="span" color="primary.main">
            Master your craft.
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 480, mx: 'auto', mb: 4, fontSize: '1.0625rem' }}
        >
          A structured practice tracker built around the JustinGuitar curriculum. Log sessions,
          follow a 5-phase roadmap, and see your progress over time.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login?mode=signup')}
            sx={{ px: 4, py: 1.25, fontSize: '1rem' }}
          >
            Get started — it's free
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ px: 4, py: 1.25, fontSize: '1rem' }}
          >
            Log in
          </Button>
        </Box>
      </Container>

      {/* Features */}
      <Container maxWidth="md" sx={{ pb: 12 }}>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid size={{ xs: 12, sm: 6 }} key={f.title}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box
                  sx={{
                    width: 44, height: 44,
                    bgcolor: '#fef3ee',
                    borderRadius: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Guitar Mastery Hub — built to learn, built to last
        </Typography>
      </Box>
    </Box>
  );
}
