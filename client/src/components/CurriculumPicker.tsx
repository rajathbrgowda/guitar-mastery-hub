import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { CurriculumSource } from '@gmh/shared/types/curriculum';
import { useCurriculumStore } from '../store/curriculumStore';

const STYLE_CHIP: Record<
  string,
  { label: string; color: 'primary' | 'secondary' | 'success' | 'default' }
> = {
  structured: { label: 'Structured', color: 'primary' },
  'song-first': { label: 'Song-first', color: 'success' },
  technique: { label: 'Technique', color: 'secondary' },
};

interface CurriculumPickerProps {
  currentKey: string;
  onSwitch?: (newKey: string) => void;
}

export function CurriculumPicker({ currentKey, onSwitch }: CurriculumPickerProps) {
  const { curricula, isLoadingList, listError, fetchCurricula, switchCurriculum } =
    useCurriculumStore();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => {
    if (curricula.length === 0) fetchCurricula();
  }, [curricula.length, fetchCurricula]);

  const handleSelect = (key: string) => {
    if (key === currentKey) return;
    setConfirmKey(key);
    setSwitchError(null);
  };

  const handleConfirm = async () => {
    if (!confirmKey) return;
    setSwitching(true);
    setSwitchError(null);
    try {
      await switchCurriculum(confirmKey);
      onSwitch?.(confirmKey);
      setConfirmKey(null);
    } catch {
      setSwitchError('Failed to switch curriculum. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  const confirmCurriculum = curricula.find((c) => c.key === confirmKey);

  if (isLoadingList) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={90} />
        ))}
      </Box>
    );
  }

  if (listError) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Couldn't load curricula. Check your connection and try again.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchCurricula()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {curricula.map((c: CurriculumSource) => {
          const isActive = c.key === currentKey;
          const styleChip = c.style ? STYLE_CHIP[c.style] : null;

          return (
            <Card
              key={c.key}
              variant="outlined"
              sx={{
                borderColor: isActive ? 'primary.main' : 'divider',
                borderWidth: isActive ? 2 : 1,
                transition: 'border-color 0.2s',
              }}
            >
              <CardActionArea onClick={() => handleSelect(c.key)} disabled={isActive}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {c.name}
                      </Typography>
                      {c.author && (
                        <Typography variant="caption" color="text.secondary">
                          by {c.author}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        flexShrink: 0,
                        ml: 1,
                      }}
                    >
                      {styleChip && (
                        <Chip
                          label={styleChip.label}
                          color={styleChip.color}
                          size="small"
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                      )}
                      {isActive && <CheckCircleIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
                    </Box>
                  </Box>

                  {c.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1.5 }}
                    >
                      {c.description}
                    </Typography>
                  )}

                  {c.website_url && (
                    <Box
                      component="a"
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        mt: 0.5,
                        fontSize: '0.65rem',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Visit website <OpenInNewIcon sx={{ fontSize: 10 }} />
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Confirmation dialog */}
      <Dialog
        open={Boolean(confirmKey)}
        onClose={() => !switching && setConfirmKey(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Switch Curriculum?</DialogTitle>
        <DialogContent>
          {switchError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {switchError}
            </Alert>
          )}
          <Typography variant="body2" gutterBottom>
            You're switching to <strong>{confirmCurriculum?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your progress in your current curriculum is saved and can be restored by switching back.
            Your new curriculum will have its own independent progress tracker.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmKey(null)} disabled={switching}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={switching}
            startIcon={switching ? <CircularProgress size={14} /> : null}
          >
            {switching ? 'Switching…' : 'Switch curriculum'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
