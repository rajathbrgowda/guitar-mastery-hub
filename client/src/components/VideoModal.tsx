import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Dialog, DialogContent, IconButton, Skeleton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  youtubeId: string | null;
  title?: string;
}

export function VideoModal({ open, onClose, youtubeId, title }: VideoModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Reset error state whenever a new video opens
  useEffect(() => {
    if (open) setVideoError(false);
  }, [open, youtubeId]);

  // Close on Esc key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Stop video playback when modal closes by blanking src
  useEffect(() => {
    if (!open && iframeRef.current) {
      iframeRef.current.src = '';
    }
  }, [open]);

  // Detect YouTube Player API errors via postMessage
  // Error codes: 2=bad params, 5=HTML5 error, 100=removed/private, 101/150=embedding disabled
  useEffect(() => {
    if (!open) return;
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== 'string') return;
      try {
        const data = JSON.parse(e.data) as { event?: string; info?: { playerError?: number } };
        if (data.event === 'infoDelivery' && data.info?.playerError) {
          setVideoError(true);
        }
      } catch {
        // not a YouTube message — ignore
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#000', borderRadius: 2, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {title ?? 'Video Lesson'}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close video">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: '#000' }}>
        {youtubeId && !videoError ? (
          <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 */ }}>
            <Box
              component="iframe"
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
              title={title ?? 'Video Lesson'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </Box>
        ) : videoError ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              gap: 2,
              bgcolor: 'background.paper',
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Alert severity="warning" sx={{ maxWidth: 360 }}>
              This video is unavailable. It may have been removed or embedding disabled.
            </Alert>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1,
              bgcolor: 'background.paper',
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary">No video available for this lesson yet.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface VideoThumbnailProps {
  youtubeId: string | null;
  title?: string;
  onClick: () => void;
}

export function VideoThumbnail({ youtubeId, title, onClick }: VideoThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  if (!youtubeId) return null;

  const sharedBoxProps = {
    onClick,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => e.key === 'Enter' && onClick(),
    'aria-label': `Watch video: ${title ?? 'Lesson'}`,
  };

  // Thumbnail failed to load — show music note placeholder instead of blank box
  if (imgError) {
    return (
      <Box
        {...sharedBoxProps}
        sx={{
          width: 100,
          height: 56,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <MusicNoteIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
      </Box>
    );
  }

  return (
    <Box
      {...sharedBoxProps}
      sx={{
        position: 'relative',
        width: 100,
        height: 56,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        flexShrink: 0,
        '&:hover .play-overlay': { opacity: 1 },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Box
        component="img"
        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
        alt={title ?? 'Video lesson thumbnail'}
        loading="lazy"
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => setImgError(true)}
      />
      {/* Play overlay */}
      <Box
        className="play-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.5)',
          opacity: 0.7,
          transition: 'opacity 0.15s',
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'error.main',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '9px solid white',
              ml: '2px',
            }}
          />
        </Box>
      </Box>
      {/* Loading skeleton fallback */}
      <Skeleton
        variant="rectangular"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'none',
        }}
      />
    </Box>
  );
}
