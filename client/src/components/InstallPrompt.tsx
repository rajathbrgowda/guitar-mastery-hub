import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'gmh_install_dismissed_at';
const VISIT_KEY = 'gmh_visit_count';
const DISMISS_DAYS = 30;

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return;

    // Visit counter — only show after 2nd visit
    const visits = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));
    if (visits < 2) return;

    // Check dismiss cooldown
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    // Listen for native install prompt (Chrome/Edge/etc)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS fallback — show manual instructions after visit threshold
    if (isIOS()) {
      setShowBanner(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: { xs: 64, sm: 16 },
        left: 16,
        right: 16,
        maxWidth: 400,
        mx: 'auto',
        zIndex: 1300,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 2,
      }}
    >
      <GetAppIcon sx={{ color: 'primary.main', fontSize: 28, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          Add to Home Screen
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isIOS() ? 'Tap Share → Add to Home Screen' : 'Quick access to your practice tracker'}
        </Typography>
      </Box>
      {deferredPrompt && (
        <Button size="small" variant="contained" onClick={handleInstall} sx={{ flexShrink: 0 }}>
          Install
        </Button>
      )}
      <IconButton size="small" onClick={handleDismiss}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
