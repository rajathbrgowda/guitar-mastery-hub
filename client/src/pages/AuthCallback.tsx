import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // Check for OAuth error redirect (e.g. user cancelled Google picker)
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');

    if (oauthError) {
      const msg = oauthError === 'access_denied' ? 'oauth_cancelled' : 'oauth_failed';
      navigate(`/login?error=${msg}`, { replace: true });
      return;
    }

    // The Supabase SDK automatically exchanges the PKCE code on init
    // (detectSessionInUrl: true + flowType: 'pkce'). We must NOT call
    // exchangeCodeForSession() here — it would try to re-use the already-consumed
    // code verifier and fail. Instead, check if the session is already ready,
    // or wait for the SIGNED_IN event the SDK will fire after the exchange.

    function redirect(to: string) {
      if (handled.current) return;
      handled.current = true;
      navigate(to, { replace: true });
    }

    // Case A: SDK already completed the exchange before this component mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirect('/app');
      }
    });

    // Case B: SDK exchange is still in flight — wait for the SIGNED_IN event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        redirect('/app');
      } else if (event === 'SIGNED_OUT') {
        redirect('/login?error=oauth_failed');
      }
    });

    // Timeout — if neither fires in 12s, something is wrong
    const timeout = setTimeout(() => {
      redirect('/login?error=oauth_timeout');
    }, 12_000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
}
