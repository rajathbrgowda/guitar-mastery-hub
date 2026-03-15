import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useMilestoneStore } from '../store/milestoneStore';

const CONFETTI_COLORS = [
  '#ea580c',
  '#2563eb',
  '#16a34a',
  '#7c3aed',
  '#e11d48',
  '#f59e0b',
  '#06b6d4',
  '#84cc16',
  '#f43f5e',
  '#8b5cf6',
];

function Confetti() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1399,
        overflow: 'hidden',
        '@keyframes confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 },
        },
      }}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: `${Math.random() * -10}%`,
            left: `${(i / 20) * 100 + Math.random() * 5}%`,
            width: 8 + Math.random() * 6,
            height: 8 + Math.random() * 6,
            bgcolor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${2.5 + Math.random() * 2}s ${Math.random() * 0.8}s ease-in forwards`,
          }}
        />
      ))}
    </Box>
  );
}

export function MilestoneCelebration() {
  const theme = useTheme();
  const { newlyEarned, dismissCelebration } = useMilestoneStore();

  useEffect(() => {
    if (!newlyEarned) return;
    const timer = setTimeout(dismissCelebration, 4000);
    return () => clearTimeout(timer);
  }, [newlyEarned, dismissCelebration]);

  if (!newlyEarned) return null;

  return (
    <>
      <Confetti />
      <Box
        onClick={dismissCelebration}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1400,
          bgcolor: alpha('#000', 0.5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 4,
            maxWidth: 340,
            width: '100%',
            textAlign: 'center',
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 52, color: 'warning.main', mb: 1 }} />
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Achievement Unlocked
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {newlyEarned.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {newlyEarned.description}
          </Typography>
          <Button variant="contained" onClick={dismissCelebration} sx={{ px: 4 }}>
            Got it
          </Button>
        </Box>
      </Box>
    </>
  );
}
