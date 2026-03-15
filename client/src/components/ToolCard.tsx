import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { Tool } from '@gmh/shared/types';

const PRICE_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  free: 'success',
  freemium: 'warning',
  paid: 'default',
};

function Stars({ rating }: { rating: number }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: i <= rating ? 'primary.main' : 'action.disabledBackground',
            border: i <= rating ? 'none' : `1px solid ${theme.palette.divider}`,
          }}
        />
      ))}
    </Box>
  );
}

interface ToolCardProps {
  tool: Tool;
  onToggle: (tool: Tool) => void;
  toggling?: boolean;
}

export default function ToolCard({ tool, onToggle, toggling = false }: ToolCardProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: tool.is_using ? `1.5px solid ${primary}` : `1px solid ${theme.palette.divider}`,
        bgcolor: tool.is_using ? alpha(primary, 0.04) : 'background.paper',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <CardContent sx={{ flex: 1, pb: '12px !important' }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 0.75,
          }}
        >
          <Box
            component="a"
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {tool.name}
            </Typography>
            <OpenInNewOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          </Box>
          <Stars rating={tool.stars} />
        </Box>

        {/* Description */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1.25, lineHeight: 1.5 }}
        >
          {tool.description}
        </Typography>

        {/* Badges */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip
            label={tool.price}
            size="small"
            color={PRICE_COLOR[tool.price]}
            variant="outlined"
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
          <Chip
            label={tool.platform}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
        </Box>

        {/* Toggle button */}
        <Button
          size="small"
          variant={tool.is_using ? 'contained' : 'outlined'}
          color={tool.is_using ? 'primary' : 'inherit'}
          startIcon={tool.is_using ? <CheckCircleOutlineIcon /> : <AddCircleOutlineIcon />}
          disabled={toggling}
          onClick={() => onToggle(tool)}
          sx={{ fontSize: '0.7rem', py: 0.4 }}
          fullWidth
        >
          {tool.is_using ? 'In my toolkit ✓' : 'I use this'}
        </Button>
      </CardContent>
    </Card>
  );
}
