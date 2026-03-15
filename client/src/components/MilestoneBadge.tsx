import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LockIcon from '@mui/icons-material/Lock';
import type { Milestone } from '@gmh/shared/types/milestones';

function CategoryIcon({ category, earned }: { category: Milestone['category']; earned: boolean }) {
  const theme = useTheme();
  const color = earned ? theme.palette.primary.main : theme.palette.text.disabled;
  const iconProps = { sx: { fontSize: 28, color } };
  switch (category) {
    case 'sessions':
      return <EmojiEventsIcon {...iconProps} />;
    case 'streak':
      return <LocalFireDepartmentIcon {...iconProps} />;
    case 'time':
      return <AccessTimeIcon {...iconProps} />;
    case 'plans':
      return <TaskAltIcon {...iconProps} />;
  }
}

interface MilestoneBadgeProps {
  milestone: Milestone;
}

export function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const theme = useTheme();
  const { earned, earned_at } = milestone;

  return (
    <Box
      sx={{
        minWidth: 140,
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: earned ? alpha(theme.palette.primary.main, 0.3) : 'divider',
        bgcolor: earned ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 0.75,
        position: 'relative',
        opacity: earned ? 1 : 0.35,
        filter: earned ? 'none' : 'grayscale(1)',
        transition: 'opacity 0.2s',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CategoryIcon category={milestone.category} earned={earned} />
        {!earned && (
          <LockIcon
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              fontSize: 14,
              color: 'text.disabled',
              bgcolor: 'background.paper',
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.3, fontSize: '0.72rem' }}>
        {milestone.title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.62rem', lineHeight: 1.3 }}
      >
        {milestone.description}
      </Typography>
      {earned && earned_at && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.58rem',
            color: 'primary.main',
            fontFamily: '"IBM Plex Mono", monospace',
          }}
        >
          {earned_at}
        </Typography>
      )}
    </Box>
  );
}
