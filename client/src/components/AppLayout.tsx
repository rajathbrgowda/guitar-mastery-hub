import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Avatar from '@mui/material/Avatar';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { useInsightsStore } from '../store/insightsStore';
import { useMilestoneStore } from '../store/milestoneStore';
import { MilestoneCelebration } from './MilestoneCelebration';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 220;

const navItems = [
  { label: 'Dashboard', to: '/app', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Roadmap', to: '/app/roadmap', icon: <MapOutlinedIcon fontSize="small" /> },
  { label: 'Practice', to: '/app/practice', icon: <TimerOutlinedIcon fontSize="small" /> },
  { label: 'Skill Tree', to: '/app/skills', icon: <AccountTreeOutlinedIcon fontSize="small" /> },
  { label: 'Analytics', to: '/app/analytics', icon: <BarChartOutlinedIcon fontSize="small" /> },
  { label: 'Resources', to: '/app/resources', icon: <LibraryBooksOutlinedIcon fontSize="small" /> },
  { label: 'Tools', to: '/app/tools', icon: <BuildOutlinedIcon fontSize="small" /> },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, fetchProfile } = useUserStore();
  const { fetchInsights } = useInsightsStore();
  const { fetchMilestones } = useMilestoneStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    // Non-critical background fetches — no spinner
    fetchInsights();
    fetchMilestones();
  }, [fetchInsights, fetchMilestones]);

  const avatarInitials = (profile?.display_name ?? user?.email ?? '?')
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <PlayCircleIcon sx={{ fontSize: 30, color: 'primary.main', flexShrink: 0 }} />
          <Box>
            <Typography
              sx={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}
            >
              Guitar Mastery Hub
            </Typography>
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                lineHeight: 1,
              }}
            >
              PRACTICE TRACKER
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              sx={{ py: 0.75, px: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Avatar footer */}
      <Box
        sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
        onClick={() => {
          navigate('/app/settings');
          setMobileOpen(false);
        }}
      >
        <Avatar
          src={profile?.avatar_url ?? undefined}
          sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'primary.main' }}
        >
          {avatarInitials}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {profile?.display_name ?? user?.email?.split('@')[0] ?? 'Profile'}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: 'text.secondary',
              fontFamily: '"IBM Plex Mono", monospace',
            }}
          >
            {profile?.guitar_type ?? 'acoustic'}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/app/settings"
            onClick={() => setMobileOpen(false)}
            sx={{ py: 0.75, px: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ py: 0.75, px: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Log out"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ display: { sm: 'none' }, zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Tooltip title="Menu">
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayCircleIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }}>
              Guitar Mastery Hub
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 3 },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          maxWidth: '100%',
          overflow: 'auto',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
      <MilestoneCelebration />
    </Box>
  );
}
