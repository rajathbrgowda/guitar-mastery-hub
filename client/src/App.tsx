import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { buildTheme } from './theme/helixTheme';
import { THEME_COLORS } from './theme/themeColors';
import { useUserStore } from './store/userStore';
import { useLocalThemeMode } from './hooks/useLocalThemeMode';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { preflightHealthCheck } from './store/backendStatusStore';
import { OfflineBanner } from './components/OfflineBanner';
import { InstallPrompt } from './components/InstallPrompt';

function ThemedApp() {
  const { user } = useAuth();
  const { profile, fetchProfile } = useUserStore();
  const [localMode] = useLocalThemeMode();

  // Proactively ping backend health on SPA load — detects cold-start before
  // any authenticated API call, allowing the warming banner to show immediately.
  useEffect(() => {
    preflightHealthCheck();
  }, []);

  // Fetch profile as soon as auth resolves — not waiting for AppLayout to mount.
  // This eliminates the flash of Helix orange on login/refresh for users with a
  // non-default theme.
  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const primaryColor = THEME_COLORS[profile?.theme_color ?? 'helix']?.color ?? '#ea580c';
  // Auth users: DB value wins. Anonymous: localStorage preference.
  const themeMode = profile?.theme_mode ?? localMode;
  const theme = useMemo(() => buildTheme(primaryColor, themeMode), [primaryColor, themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OfflineBanner />
      <RouterProvider router={router} />
      <InstallPrompt />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
