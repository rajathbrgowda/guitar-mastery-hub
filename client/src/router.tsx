import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Practice from './pages/Practice';
import SkillTree from './pages/SkillTree';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import Tools from './pages/Tools';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },

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
