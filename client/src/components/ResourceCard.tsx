import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArticleIcon from '@mui/icons-material/Article';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import { alpha, useTheme } from '@mui/material/styles';
import type { ResourceWithCompletion, ResourceStatus } from '@gmh/shared/types/resources';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <PlayCircleIcon sx={{ fontSize: 16 }} />,
  article: <ArticleIcon sx={{ fontSize: 16 }} />,
  tab: <MusicNoteIcon sx={{ fontSize: 16 }} />,
  exercise: <FitnessCenterIcon sx={{ fontSize: 16 }} />,
  tool: <BuildIcon sx={{ fontSize: 16 }} />,
};

const STATUS_COLORS: Record<ResourceStatus, 'default' | 'warning' | 'success'> = {
  not_started: 'default',
  in_progress: 'warning',
  completed: 'success',
};

const STATUS_LABELS: Record<ResourceStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

interface ResourceCardProps {
  resource: ResourceWithCompletion;
  onMarkComplete: (id: string) => void;
}

export function ResourceCard({ resource, onMarkComplete }: ResourceCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: resource.is_recommended ? '3px solid' : '1px solid',
        borderLeftColor: resource.is_recommended ? 'primary.main' : 'divider',
        bgcolor: resource.is_recommended
          ? alpha(theme.palette.primary.main, 0.03)
          : 'background.paper',
      }}
    >
      <CardContent sx={{ flex: 1, pb: 0 }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              icon={TYPE_ICONS[resource.type] as React.ReactElement}
              label={resource.type}
              size="small"
              sx={{ fontSize: '0.65rem', height: 22, textTransform: 'capitalize' }}
            />
            <Chip
              label={`Phase ${resource.phase_index}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 22 }}
            />
          </Box>
          {resource.is_featured && (
            <StarIcon sx={{ fontSize: 16, color: 'warning.main', flexShrink: 0 }} />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ mb: resource.description ? 0.5 : 1, lineHeight: 1.4 }}
        >
          {resource.title}
        </Typography>

        {resource.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}
          >
            {resource.description}
          </Typography>
        )}

        {/* Progress */}
        {resource.status !== 'not_started' && (
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={resource.completion}
              color={resource.status === 'completed' ? 'success' : 'primary'}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { borderRadius: 2 },
              }}
            />
          </Box>
        )}

        {/* Status chip */}
        <Chip
          label={STATUS_LABELS[resource.status]}
          size="small"
          color={STATUS_COLORS[resource.status]}
          variant={resource.status === 'not_started' ? 'outlined' : 'filled'}
          sx={{ fontSize: '0.6rem', height: 20 }}
        />
      </CardContent>

      <CardActions sx={{ pt: 0.5, pb: 1, px: 2, justifyContent: 'space-between' }}>
        {resource.status !== 'completed' && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            onClick={() => onMarkComplete(resource.id)}
          >
            Mark complete
          </Typography>
        )}
        <Box sx={{ ml: 'auto' }}>
          <IconButton
            size="small"
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open resource"
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}
