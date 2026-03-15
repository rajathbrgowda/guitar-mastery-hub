import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  noPadding?: boolean;
}

export default function Panel({ title, children, action, noPadding = false }: PanelProps) {
  return (
    <Card>
      {(title || action) && (
        <Box
          sx={{
            px: 2.5, pt: 2, pb: title ? 0 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          {title && (
            <Typography
              variant="overline"
              color="text.secondary"
            >
              {title}
            </Typography>
          )}
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {noPadding ? <Box>{children}</Box> : <CardContent>{children}</CardContent>}
    </Card>
  );
}
