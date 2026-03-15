import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { Tool } from '@gmh/shared/types';

const MAX_VISIBLE = 5;

interface MyToolkitSectionProps {
  tools: Tool[];
}

export default function MyToolkitSection({ tools }: MyToolkitSectionProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  if (tools.length === 0) {
    return (
      <Card sx={{ mb: 3, borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BuildOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="overline" color="text.secondary">
              My Toolkit
            </Typography>
          </Box>
          <Typography variant="body2" color="text.disabled">
            Mark tools you use below to build your personal toolkit.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const visible = tools.slice(0, MAX_VISIBLE);
  const remaining = tools.length - MAX_VISIBLE;

  return (
    <Card sx={{ mb: 3, borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BuildOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="overline" color="text.secondary">
            My Toolkit
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
            {tools.length} tool{tools.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {visible.map((tool) => (
            <Tooltip key={tool.key} title={tool.description} arrow placement="top">
              <Box
                component="a"
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.6,
                  borderRadius: 1,
                  border: `1px solid ${alpha(primary, 0.35)}`,
                  bgcolor: alpha(primary, 0.06),
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: alpha(primary, 0.12) },
                }}
              >
                {tool.name}
                <OpenInNewOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              </Box>
            </Tooltip>
          ))}
          {remaining > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              and {remaining} more in your toolkit
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
