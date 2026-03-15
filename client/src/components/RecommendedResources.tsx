import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ResourceCard } from './ResourceCard';
import type { ResourceWithCompletion } from '@gmh/shared/types/resources';

interface RecommendedResourcesProps {
  resources: ResourceWithCompletion[];
  onMarkComplete: (id: string) => void;
}

export function RecommendedResources({ resources, onMarkComplete }: RecommendedResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 2, letterSpacing: '0.08em' }}
      >
        Recommended for your phase
      </Typography>
      <Grid container spacing={2}>
        {resources.map((r) => (
          <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ResourceCard resource={r} onMarkComplete={onMarkComplete} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
