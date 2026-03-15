import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { buildTheme } from './theme/helixTheme';
import { THEME_COLORS } from './theme/themeColors';
import { useUserStore } from './store/userStore';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';

function ThemedApp() {
  const { user } = useAuth();
  const { profile, fetchProfile } = useUserStore();

  // Fetch profile as soon as auth resolves — not waiting for AppLayout to mount.
  // This eliminates the flash of Helix orange on login/refresh for users with a
  // non-default theme.
  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const primaryColor = THEME_COLORS[profile?.theme_color ?? 'helix']?.color ?? '#ea580c';
  const theme = useMemo(() => buildTheme(primaryColor), [primaryColor]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
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
