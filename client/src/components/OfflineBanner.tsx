import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <Slide direction="down" in={!online} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          justifyContent: 'center',
          py: 0.5,
          fontSize: '0.8rem',
        }}
      >
        Offline — showing cached content
      </Alert>
    </Slide>
  );
}
