import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import type { PublicStats } from '@gmh/shared/types';

// CARD-319: Quiet confident close CTA copy
// CARD-320: CloseCTA component
// CARD-321: Wire public stats with graceful fallback

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function CloseCTA() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicStats | null) => {
        if (data && typeof data.total_users === 'number') setStats(data);
      })
      .catch(() => {
        // graceful fallback — show CTA without stats
      });
  }, []);

  return (
    <Box
      id="get-started"
      sx={{ bgcolor: 'background.default', py: { xs: 6, sm: 10 }, textAlign: 'center' }}
      aria-labelledby="close-cta-heading"
    >
      <Container maxWidth="sm">
        {stats && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, fontVariantNumeric: 'tabular-nums' }}
            aria-live="polite"
          >
            {stats.total_users.toLocaleString()} guitarists tracking practice &middot;{' '}
            {stats.total_sessions.toLocaleString()} sessions logged
          </Typography>
        )}

        <Typography
          id="close-cta-heading"
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 1.5, letterSpacing: '-0.02em' }}
        >
          Start free.{' '}
          <Box component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
            No credit card.
          </Box>
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.65 }}>
          Your practice history, streaks, and roadmap — all in one place. Takes 30 seconds to set
          up.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login?mode=signup')}
          sx={{ px: 5, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
          aria-label="Create your free account"
        >
          Create account
        </Button>
      </Container>
    </Box>
  );
}
