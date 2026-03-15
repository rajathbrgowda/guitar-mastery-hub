import { Navigate, createBrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from './context/AuthContext';
import { useUserStore } from './store/userStore';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Demo from './pages/Demo';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import OnboardingWizard from './pages/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Practice from './pages/Practice';
import SkillTree from './pages/SkillTree';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import ActivePracticeMode from './pages/ActivePracticeMode';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserStore();

  if (authLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  // Wait for profile to load before checking onboarding state
  if (profileLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Profile loaded and onboarding not done → send to wizard
  // (profile === null means fetch failed — let app proceed to avoid infinite redirect)
  if (profile !== null && profile.onboarding_completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserStore();

  if (authLoading || profileLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Not logged in → login
  if (!session) return <Navigate to="/login" replace />;

  // Onboarding already done → straight to app
  if (profile?.onboarding_completed === true) return <Navigate to="/app" replace />;

  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/demo', element: <Demo /> },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/auth/callback', element: <AuthCallback /> },

  // Onboarding (authenticated but not yet onboarded)
  {
    path: '/onboarding',
    element: (
      <OnboardingRoute>
        <OnboardingWizard />
      </OnboardingRoute>
    ),
  },

  // Protected app shell — all pages live under /app
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'roadmap', element: <Roadmap /> },
      { path: 'practice', element: <Practice /> },
      { path: 'practice/session', element: <ActivePracticeMode /> },
      { path: 'skills', element: <SkillTree /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'resources', element: <Resources /> },
      { path: 'tools', element: <Tools /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
