import { useState } from 'react';
import { Box, Checkbox, Chip, Collapse, IconButton, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { PracticePlanItem } from '@gmh/shared/types/practice-plan';
import { VideoModal, VideoThumbnail } from './VideoModal';

const CATEGORY_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
> = {
  warmup: 'warning',
  chord: 'primary',
  scale: 'secondary',
  technique: 'default',
  theory: 'default',
  song: 'success',
};

const CATEGORY_LABELS: Record<string, string> = {
  warmup: 'Warm-up',
  chord: 'Chord',
  scale: 'Scale',
  technique: 'Technique',
  theory: 'Theory',
  song: 'Song',
};

interface PracticeItemProps {
  item: PracticePlanItem;
  onComplete: (itemId: string) => Promise<void>;
  disabled?: boolean;
}

export function PracticeItem({ item, onComplete, disabled = false }: PracticeItemProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (item.completed || completing || disabled) return;
    setCompleting(true);
    try {
      await onComplete(item.id);
    } finally {
      setCompleting(false);
    }
  };

  const categoryColor = CATEGORY_COLORS[item.skill_category] ?? 'default';
  const categoryLabel = CATEGORY_LABELS[item.skill_category] ?? item.skill_category;

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          opacity: item.completed ? 0.55 : 1,
          transition: 'opacity 0.3s',
          borderColor: item.completed ? 'success.main' : 'divider',
          borderWidth: item.completed ? 1.5 : 1,
        }}
      >
        {/* Completion checkbox */}
        <Checkbox
          checked={item.completed}
          onChange={handleComplete}
          disabled={item.completed || completing || disabled}
          size="small"
          color="success"
          sx={{ mt: 0.25, p: 0 }}
          inputProps={{ 'aria-label': `Mark ${item.skill_title} as done` }}
        />

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                textDecoration: item.completed ? 'line-through' : 'none',
                flex: 1,
                minWidth: 0,
              }}
            >
              {item.skill_title}
            </Typography>
            <Chip
              label={categoryLabel}
              color={categoryColor}
              size="small"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: '0.75rem !important' }} />}
              label={`${item.duration_min} min`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          </Box>

          {/* Practice tip (collapsible) */}
          {item.practice_tip && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: tipOpen ? 0.5 : 0,
                }}
                onClick={() => setTipOpen((v) => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setTipOpen((v) => !v)}
                aria-expanded={tipOpen}
              >
                <MusicNoteIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                  {tipOpen ? 'Hide tip' : 'Show practice tip'}
                </Typography>
                <IconButton size="small" sx={{ p: 0, ml: 0.25 }} tabIndex={-1}>
                  {tipOpen ? (
                    <ExpandLessIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Box>
              <Collapse in={tipOpen}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="p"
                  sx={{
                    lineHeight: 1.6,
                    pl: 2,
                    borderLeft: 2,
                    borderColor: 'primary.main',
                    ml: 0.5,
                  }}
                >
                  {item.practice_tip}
                </Typography>
              </Collapse>
            </Box>
          )}
        </Box>

        {/* Video thumbnail */}
        {item.video_youtube_id && (
          <VideoThumbnail
            youtubeId={item.video_youtube_id}
            title={item.skill_title}
            onClick={() => setVideoOpen(true)}
          />
        )}
      </Paper>

      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        youtubeId={item.video_youtube_id}
        title={item.skill_title}
      />
    </>
  );
}
