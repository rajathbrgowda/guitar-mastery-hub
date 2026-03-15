import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const authAppearance = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: '#ea580c',
        brandAccent: '#c2410c',
        inputBackground: '#ffffff',
        inputBorder: '#e5e0df',
        inputText: '#171414',
        inputLabelText: '#5c5858',
        messageText: '#5c5858',
        anchorTextColor: '#ea580c',
        anchorTextHoverColor: '#c2410c',
      },
      radii: {
        borderRadiusButton: '6px',
        inputBorderRadius: '6px',
      },
      fonts: {
        bodyFontFamily: '"Inter", sans-serif',
        buttonFontFamily: '"Inter", sans-serif',
        inputFontFamily: '"Inter", sans-serif',
        labelFontFamily: '"Inter", sans-serif',
      },
    },
  },
};

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('mode') === 'signup' ? 'sign_up' : 'sign_in';

  useEffect(() => {
    if (session) navigate('/app', { replace: true });
  }, [session, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Guitar Mastery Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {initialView === 'sign_up' ? 'Create your free account' : 'Welcome back'}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Auth
            supabaseClient={supabase}
            view={initialView}
            appearance={authAppearance}
            providers={['google']}
            redirectTo={`${window.location.origin}/app`}
            showLinks
          />
        </Paper>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2.5 }}>
          <Link to="/" style={{ color: '#5c5858', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
