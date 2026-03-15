import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth error redirect (e.g. user cancelled Google picker)
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    const oauthErrorDesc = params.get('error_description');

    if (oauthError) {
      const msg =
        oauthError === 'access_denied'
          ? 'Sign-in was cancelled.'
          : (oauthErrorDesc ?? 'OAuth sign-in failed.');
      setError(msg);
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    // Timeout — if exchange takes >10s something is wrong
    const timeout = setTimeout(() => {
      setError('Sign-in timed out. Please try again.');
      setTimeout(() => navigate('/login'), 2000);
    }, 10_000);

    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error: exchangeError }) => {
      clearTimeout(timeout);
      if (exchangeError) {
        const msg = exchangeError.message.includes('code verifier')
          ? 'Sign-in session expired. Please try again.'
          : exchangeError.message;
        setError(msg);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        navigate('/app', { replace: true });
      }
    });

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      {error ? (
        <Typography color="error" sx={{ maxWidth: 360, textAlign: 'center' }}>
          {error} — redirecting to login…
        </Typography>
      ) : (
        <>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">
            Signing you in…
          </Typography>
        </>
      )}
    </Box>
  );
}
