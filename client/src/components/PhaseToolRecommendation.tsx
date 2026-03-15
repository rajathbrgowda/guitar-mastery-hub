import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import type { Tool } from '@gmh/shared/types';
import ToolCard from './ToolCard';

interface PhaseToolRecommendationProps {
  recommended: Tool[];
  phaseNumber: number;
  onToggle: (tool: Tool) => void;
  toggling: string | null;
}

export default function PhaseToolRecommendation({
  recommended,
  phaseNumber,
  onToggle,
  toggling,
}: PhaseToolRecommendationProps) {
  if (recommended.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <LightbulbOutlinedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
        <Typography variant="overline" color="text.secondary">
          Recommended for Phase {phaseNumber}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {recommended.map((tool) => (
          <Grid size={{ xs: 12, sm: 6 }} key={tool.key}>
            <ToolCard tool={tool} onToggle={onToggle} toggling={toggling === tool.key} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
