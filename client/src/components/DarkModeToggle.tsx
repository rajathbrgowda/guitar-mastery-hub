import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { useLocalThemeMode } from '../hooks/useLocalThemeMode';
import type { ThemeMode } from '@gmh/shared/types/user';

export function DarkModeToggle() {
  const { session } = useAuth();
  const { profile, updateProfile } = useUserStore();
  const [localMode, setLocalMode] = useLocalThemeMode();

  const mode: ThemeMode = session && profile ? (profile.theme_mode ?? 'light') : localMode;

  const toggle = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    if (session && profile) {
      void updateProfile({ theme_mode: next });
    } else {
      setLocalMode(next);
    }
  };

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggle} size="small" color="inherit" aria-label="toggle dark mode">
        {mode === 'dark' ? (
          <LightModeIcon sx={{ fontSize: 18 }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
