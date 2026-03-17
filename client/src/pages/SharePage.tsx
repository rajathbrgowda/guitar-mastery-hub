/**
 * SharePage — CARD-498
 * Public page: /share/:userId — shows user's latest completed milestone.
 * No auth required. CTA → /register for organic acquisition.
 */

import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { PublicMilestoneResponse } from '@gmh/shared/types/milestones';

const API_BASE =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string)
    : 'https://guitar-mastery-hub.onrender.com';

export default function SharePage() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<PublicMilestoneResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/public/milestones/${encodeURIComponent(userId)}/latest`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error('Failed to load');
        return r.json() as Promise<PublicMilestoneResponse>;
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  // OG meta tags
  useEffect(() => {
    if (!data) return;
    const title = `${data.phase_title} Complete — Guitar Mastery Hub`;
    const description = `Just mastered ${data.skills_count} guitar skills on the ${data.curriculum_name} curriculum.`;

    document.title = title;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', 'website');
    setMeta('og:url', window.location.href);

    return () => {
      document.title = 'Guitar Mastery Hub';
    };
  }, [data]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (notFound || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 }, textAlign: 'center' }}>
        <MusicNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          No milestones yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          This user hasn't shared any completed milestones yet. Start your own journey!
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Start your journey
        </Button>
      </Container>
    );
  }

  const completedLabel = data.completed_at
    ? new Date(data.completed_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 4, sm: 8 },
      }}
    >
      {/* Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <MusicNoteIcon sx={{ color: '#6366f1', fontSize: 28 }} />
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: '#94a3b8', letterSpacing: 0.5 }}
        >
          Guitar Mastery Hub
        </Typography>
      </Box>

      {/* Milestone card */}
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          bgcolor: '#1e293b',
          border: '1px solid #334155',
          borderTop: '4px solid #6366f1',
          borderRadius: 3,
          mb: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#f8fafc', lineHeight: 1.2 }}>
                {data.phase_title} Complete
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.25 }}>
                {data.curriculum_name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {data.skills_count} skills mastered
              {completedLabel ? ` · ${completedLabel}` : ''}
            </Typography>
          </Box>

          <Chip
            label={`Phase ${data.phase_number}`}
            size="small"
            sx={{
              bgcolor: '#6366f1',
              color: '#fff',
              fontSize: '0.7rem',
              height: 22,
              fontWeight: 600,
            }}
          />
        </CardContent>
      </Card>

      {/* CTA */}
      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2, textAlign: 'center' }}>
        Ready to start your own guitar journey?
      </Typography>
      <Button
        component={RouterLink}
        to="/login"
        variant="contained"
        size="large"
        sx={{
          bgcolor: '#6366f1',
          '&:hover': { bgcolor: '#4f46e5' },
          borderRadius: 2,
          px: 4,
          fontWeight: 700,
        }}
      >
        Start learning guitar for free
      </Button>
    </Box>
  );
}
