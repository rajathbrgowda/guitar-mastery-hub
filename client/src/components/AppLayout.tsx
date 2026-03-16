import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Avatar from '@mui/material/Avatar';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { useInsightsStore } from '../store/insightsStore';
import { useMilestoneStore } from '../store/milestoneStore';
import { MilestoneCelebration } from './MilestoneCelebration';
import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';

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

// Bottom nav — 4 primary destinations + More drawer trigger
const bottomNavItems = [
  { label: 'Dashboard', to: '/app', exact: true, icon: <DashboardOutlinedIcon /> },
  { label: 'Practice', to: '/app/practice', icon: <TimerOutlinedIcon /> },
  { label: 'Roadmap', to: '/app/roadmap', icon: <MapOutlinedIcon /> },
  { label: 'Analytics', to: '/app/analytics', icon: <BarChartOutlinedIcon /> },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, fetchProfile } = useUserStore();
  const { fetchInsights } = useInsightsStore();
  const { fetchMilestones } = useMilestoneStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
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

  const bottomNavValue = bottomNavItems.findIndex((item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <PlayCircleIcon sx={{ fontSize: 30, color: 'primary.main', flexShrink: 0 }} />
          <Box>
            <Typography
              sx={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}
            >
              Fretwork
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
              end={item.to === '/app'}
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
        <Box sx={{ ml: 'auto' }}>
          <DarkModeToggle />
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
      {/* Mobile AppBar — slim: logo + dark toggle only (hamburger removed in favour of bottom nav) */}
      <AppBar position="fixed" sx={{ display: { sm: 'none' }, zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: 52 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <PlayCircleIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary' }}>
              Fretwork
            </Typography>
          </Box>
          <Tooltip title="More">
            <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ mr: 0.5 }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <DarkModeToggle />
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer — opened by bottom nav More or top-bar ••• */}
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
          pb: { xs: 9, sm: 3 },
          backgroundColor: 'background.default',
          maxWidth: '100%',
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile bottom navigation */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <BottomNavigation
          value={bottomNavValue === -1 ? false : bottomNavValue}
          sx={{ bgcolor: 'background.paper', height: 56 }}
        >
          {bottomNavItems.map((item, idx) => (
            <BottomNavigationAction
              key={item.to}
              label={item.label}
              icon={item.icon}
              value={idx}
              onClick={() => navigate(item.to)}
              sx={{ minWidth: 0, fontSize: '0.65rem', px: 0 }}
            />
          ))}
          <BottomNavigationAction
            label="More"
            icon={<MoreHorizIcon />}
            value={-1}
            onClick={() => setMobileOpen(true)}
            sx={{ minWidth: 0, fontSize: '0.65rem', px: 0 }}
          />
        </BottomNavigation>
      </Paper>

      <MilestoneCelebration />
    </Box>
  );
}
