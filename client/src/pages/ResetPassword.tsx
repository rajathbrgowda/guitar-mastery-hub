import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { supabase } from '../lib/supabase';

// Supabase sends a recovery link that lands here with a hash fragment:
// /reset-password#access_token=...&type=recovery
// The Supabase client automatically exchanges this token on load.

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for Supabase client to process the recovery token from the URL hash
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        // No recovery session — probably landed here directly, redirect to login
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    // After password is updated, Supabase fires PASSWORD_RECOVERY → SIGNED_IN
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED') {
        navigate('/login', { replace: true });
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return null;

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
          <Typography variant="h5" fontWeight={700} color="primary">
            Set new password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Choose a new password for your account
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Auth
            supabaseClient={supabase}
            view="update_password"
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
                  radii: { borderRadiusButton: '6px', inputBorderRadius: '6px' },
                  fonts: {
                    bodyFontFamily: '"Inter", sans-serif',
                    buttonFontFamily: '"Inter", sans-serif',
                    inputFontFamily: '"Inter", sans-serif',
                  },
                },
              },
            }}
            providers={[]}
          />
        </Paper>
      </Box>
    </Box>
  );
}
