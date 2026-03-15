import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  accentColor?: string; // defaults to primary.main
}

export default function StatCard({ icon, label, value, loading = false, accentColor }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '3px solid',
        borderLeftColor: accentColor ?? 'primary.main',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
          <Box
            sx={{
              width: 32, height: 32,
              bgcolor: '#fef3ee',
              borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton width={60} height={36} />
        ) : (
          <Typography
            sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.5rem', fontWeight: 700 }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
