import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ReactNode } from 'react';

interface ListRowProps {
  primary: string;
  secondary?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  last?: boolean;
}

export default function ListRow({ primary, secondary, leading, trailing, onClick, last = false }: ListRowProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        px: 0.5,
        borderBottom: last ? 'none' : '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: onClick ? 1 : 0,
        '&:hover': onClick ? { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) } : {},
        transition: 'background 0.15s',
      }}
    >
      {leading && <Box sx={{ flexShrink: 0 }}>{leading}</Box>}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {primary}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {secondary}
          </Typography>
        )}
      </Box>
      {trailing && <Box sx={{ flexShrink: 0 }}>{trailing}</Box>}
    </Box>
  );
}
