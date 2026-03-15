import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { ConfidenceRating as Rating } from '@gmh/shared/types/practice-plan';

interface ConfidenceRatingProps {
  skillTitle: string;
  onRate: (rating: Rating) => void;
}

const OPTIONS: { label: string; emoji: string; value: Rating; color: string }[] = [
  { label: 'Hard', emoji: '😤', value: 1, color: '#ef4444' },
  { label: 'Okay', emoji: '😐', value: 2, color: '#f59e0b' },
  { label: 'Easy', emoji: '😊', value: 3, color: '#22c55e' },
];

export function ConfidenceRating({ skillTitle, onRate }: ConfidenceRatingProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1400,
        bgcolor: 'rgba(0,0,0,0.45)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: '16px 16px 0 0',
          p: 3,
          pb: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 0.5 }}>
          How did that feel?
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 3, lineHeight: 1.3 }}
          noWrap
        >
          {skillTitle}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          {OPTIONS.map(({ label, emoji, value, color }) => (
            <Button
              key={value}
              variant="contained"
              onClick={() => onRate(value)}
              sx={{
                flex: 1,
                maxWidth: 120,
                py: 1.5,
                flexDirection: 'column',
                gap: 0.25,
                bgcolor: alpha(color, 0.12),
                color,
                border: `1.5px solid ${alpha(color, 0.3)}`,
                '&:hover': { bgcolor: alpha(color, 0.22), borderColor: color },
                boxShadow: 'none',
                borderRadius: 2,
              }}
            >
              <Typography fontSize="1.75rem" lineHeight={1}>
                {emoji}
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {label}
              </Typography>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
