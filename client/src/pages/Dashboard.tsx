import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    to: '/app/practice',
    icon: <TimerOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Practice',
    desc: 'Log a session, run the timer, track sections',
    status: 'live',
  },
  {
    to: '/app/roadmap',
    icon: <MapOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Roadmap',
    desc: '5-phase curriculum with skill checklists',
    status: 'coming',
  },
  {
    to: '/app/skills',
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Skill Tree',
    desc: 'Visual node map of your progress',
    status: 'coming',
  },
  {
    to: '/app/analytics',
    icon: <BarChartOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Analytics',
    desc: 'Streak, total minutes, charts',
    status: 'coming',
  },
  {
    to: '/app/resources',
    icon: <LibraryBooksOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Resources',
    desc: 'JustinGuitar + phase-mapped learning links',
    status: 'coming',
  },
  {
    to: '/app/tools',
    icon: <BuildOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Tools',
    desc: 'Rated guitar apps and platforms',
    status: 'coming',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.email?.split('@')[0] ?? 'there';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hey, {name} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Guitar Mastery Hub. Pick up where you left off.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {features.map((f) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
            <Card
              sx={{
                height: '100%',
                opacity: f.status === 'coming' ? 0.65 : 1,
                transition: 'opacity 0.2s, box-shadow 0.2s',
                '&:hover': f.status === 'live' ? { boxShadow: '0 4px 16px rgba(234,88,12,0.15)', opacity: 1 } : {},
              }}
            >
              <CardActionArea
                onClick={() => navigate(f.to)}
                disabled={f.status === 'coming'}
                sx={{ height: '100%', alignItems: 'flex-start', p: 0 }}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {f.title}
                    </Typography>
                    {f.status === 'coming' && (
                      <Chip label="soon" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                    {f.status === 'live' && (
                      <Chip label="live" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
