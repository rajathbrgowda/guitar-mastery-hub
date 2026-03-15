import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Guitar Mastery Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Track your practice, master your craft
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ea580c',
                    brandAccent: '#c2410c',
                    inputBackground: '#ffffff',
                    inputBorder: '#e5e0df',
                    inputText: '#171414',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    inputBorderRadius: '6px',
                  },
                  fonts: {
                    bodyFontFamily: '"Inter", sans-serif',
                    buttonFontFamily: '"Inter", sans-serif',
                    inputFontFamily: '"Inter", sans-serif',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </Paper>
      </Box>
    </Box>
  );
}
