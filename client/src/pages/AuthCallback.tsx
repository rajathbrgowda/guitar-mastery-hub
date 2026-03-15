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
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (error) {
        setError(error.message);
        setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
      } else {
        navigate('/app', { replace: true });
      }
    });
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
        <Typography color="error">{error} — redirecting to login…</Typography>
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
