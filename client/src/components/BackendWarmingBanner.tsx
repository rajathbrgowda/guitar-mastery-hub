import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useBackendStatusStore } from '../store/backendStatusStore';

export default function BackendWarmingBanner() {
  const status = useBackendStatusStore((s) => s.status);

  if (status === 'ready' || status === 'unknown') return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.modal - 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.5,
        textAlign: 'center',
      }}
    >
      {status === 'warming' && (
        <>
          <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Waking up the server — a few seconds on free hosting...
          </Typography>
          <LinearProgress sx={{ maxWidth: 320, mx: 'auto' }} />
        </>
      )}

      {status === 'unreachable' && (
        <>
          <Typography variant="body2" sx={{ mb: 0.5, color: 'error.main' }}>
            Could not reach the server. Please try again in a minute.
          </Typography>
          <Button size="small" variant="outlined" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </>
      )}
    </Box>
  );
}
