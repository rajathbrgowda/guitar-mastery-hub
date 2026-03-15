import { useEffect, useRef } from 'react';
import { Box, Dialog, DialogContent, IconButton, Skeleton, Typography } from '@mui/material';
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
        {youtubeId ? (
          <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 */ }}>
            <Box
              component="iframe"
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
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
  if (!youtubeId) return null;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Watch video: ${title ?? 'Lesson'}`}
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
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
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
