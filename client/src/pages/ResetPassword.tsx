import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';

// Supabase sends a recovery link that lands here with a hash fragment:
// /reset-password#access_token=...&type=recovery
// The Supabase client automatically exchanges this token on load.

type PageState = 'loading' | 'ready' | 'expired' | 'sent';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>('loading');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setResendEmail(data.session.user?.email ?? '');
        setState('ready');
      } else {
        // No session — check if there was a recovery attempt in the URL
        // (expired token lands here with a hash but fails to produce a session)
        const hadRecoveryToken =
          window.location.hash.includes('type=recovery') ||
          window.location.hash.includes('access_token');
        if (hadRecoveryToken) {
          setState('expired');
        } else {
          navigate('/login', { replace: true });
        }
      }
    });
  }, [navigate]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED') {
        navigate('/login', { replace: true });
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true);
    await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResending(false);
    setState('sent');
  }

  if (state === 'loading') return null;

  if (state === 'expired') {
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
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 1 }}>
            Link expired
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Password reset links expire after 24 hours. Request a new one below.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
            Back to login
          </Button>
        </Box>
      </Box>
    );
  }

  if (state === 'sent') {
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
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            New reset link sent to {resendEmail}. Check your inbox.
          </Alert>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </Box>
      </Box>
    );
  }

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
        {resendEmail && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              size="small"
              variant="text"
              color="inherit"
              disabled={resending}
              onClick={handleResend}
              startIcon={resending ? <CircularProgress size={14} /> : undefined}
            >
              {resending ? 'Sending…' : 'Resend reset link'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
