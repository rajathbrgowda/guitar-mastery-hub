import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { RoadmapPhase, RoadmapSkill } from '@gmh/shared/types/roadmap';

const fadeScale = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

interface PhaseCompleteModalProps {
  open: boolean;
  phase: RoadmapPhase;
  nextPhase: RoadmapPhase | null;
  onClose: () => void;
  onSongClick?: (skill: RoadmapSkill) => void;
}

export function PhaseCompleteModal({
  open,
  phase,
  nextPhase,
  onClose,
  onSongClick,
}: PhaseCompleteModalProps) {
  const songSkills = phase.skills.filter((s) => s.is_song);
  const visibleSongs = songSkills.slice(0, 4);
  const extraSongs = songSkills.length - 4;

  const completedLabel = phase.completed_at
    ? new Date(phase.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          animation: open ? `${fadeScale} 0.2s ease-out` : 'none',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          borderRadius: { xs: 0, sm: 3 },
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100dvh', sm: '85vh' },
          alignSelf: { xs: 'flex-end', sm: 'center' },
          overflowY: 'auto',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {/* ── Celebration header ─────────────────────────────── */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={800}>
            {phase.phase_title} Complete
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {phase.completed_skills} skills mastered
            {completedLabel ? ` · finished ${completedLabel}` : ''}
          </Typography>
        </Box>

        {/* ── Songs unlocked (CARD-443) ───────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'text.secondary',
              fontSize: '0.6rem',
            }}
          >
            Songs you can play now
          </Typography>

          {songSkills.length > 0 ? (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {visibleSongs.map((s) => (
                <Box
                  key={s.skill_key}
                  onClick={() => {
                    onSongClick?.(s);
                    onClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: onSongClick ? 'pointer' : 'default',
                    borderRadius: 1,
                    px: 0.5,
                    py: 0.25,
                    '&:hover': onSongClick ? { bgcolor: 'action.hover' } : {},
                  }}
                >
                  <MusicNoteIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                  <Typography variant="body2">{s.skill_title}</Typography>
                </Box>
              ))}
              {extraSongs > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2.5 }}>
                  + {extraSongs} more
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              You now have {phase.completed_skills} technique
              {phase.completed_skills !== 1 ? 's' : ''} under your fingers — the foundation for
              dozens of songs.
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ── What's next (CARD-444) ─────────────────────────── */}
        {nextPhase ? (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: 'text.secondary',
                fontSize: '0.6rem',
              }}
            >
              Up next — {nextPhase.phase_title}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {nextPhase.skills.slice(0, 3).map((s) => (
                <Chip
                  key={s.skill_key}
                  label={s.skill_title}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              ))}
              {nextPhase.skills.length > 3 && (
                <Chip
                  label={`+${nextPhase.skills.length - 3} more`}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              You've completed the full curriculum
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Explore a different curriculum in Settings, or revisit any phase to deepen your
              mastery.
            </Typography>
          </Box>
        )}

        {/* ── CTAs ───────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          {nextPhase ? (
            <>
              <Button variant="contained" fullWidth onClick={onClose}>
                Continue to {nextPhase.phase_title}
              </Button>
              <Button variant="outlined" fullWidth onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <Button variant="contained" fullWidth onClick={onClose}>
              Back to Roadmap
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
