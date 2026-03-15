import { useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { WeeklyDigest } from '@gmh/shared/types/analytics';

interface WeeklyDigestCardProps {
  digest: WeeklyDigest;
  daysTarget: number;
}

const DISMISS_KEY = () => {
  const today = new Date().toISOString().split('T')[0];
  return `weekly_digest_dismissed_${today}`;
};

function shouldShow(digest: WeeklyDigest, daysTarget: number): boolean {
  const today = new Date();
  const isMonday = today.getDay() === 1;
  const behindTarget = digest.days_practiced < daysTarget - 1;
  return isMonday || behindTarget;
}

export function WeeklyDigestCard({ digest, daysTarget }: WeeklyDigestCardProps) {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY()) === '1');

  if (dismissed || !shouldShow(digest, daysTarget)) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY(), '1');
    setDismissed(true);
  };

  const hitTarget = digest.days_practiced >= daysTarget;
  const missedDays = daysTarget - digest.days_practiced;

  return (
    <Card
      sx={{
        mb: 3,
        borderLeft: '3px solid',
        borderLeftColor: 'primary.main',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {hitTarget ? (
              <EmojiEventsIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            ) : (
              <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.65rem',
                color: 'text.secondary',
              }}
            >
              Last 7 days
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleDismiss} sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        <Box
          sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: digest.top_skill_title ? 1.5 : 0 }}
        >
          <Box>
            <Typography
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '1.2rem' }}
            >
              {digest.total_mins}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                min
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              total practice
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '1.2rem' }}
            >
              {digest.days_practiced}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                / {daysTarget}d
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              days practiced
            </Typography>
          </Box>
          {digest.sessions_count > 0 && (
            <Box>
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}
              >
                {digest.sessions_count}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                sessions
              </Typography>
            </Box>
          )}
        </Box>

        {digest.top_skill_title && (
          <Typography variant="caption" color="text.secondary">
            Top focus:{' '}
            <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
              {digest.top_skill_title}
            </Typography>
          </Typography>
        )}

        {!hitTarget && missedDays > 0 && (
          <Alert
            severity="info"
            icon={<WarningAmberIcon fontSize="small" />}
            sx={{ mt: 1.5, py: 0.25, '& .MuiAlert-message': { fontSize: '0.75rem' } }}
          >
            {missedDays === 1
              ? 'One day short of your weekly target — every session counts.'
              : `${missedDays} days behind your ${daysTarget}-day target. A short session today helps.`}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
