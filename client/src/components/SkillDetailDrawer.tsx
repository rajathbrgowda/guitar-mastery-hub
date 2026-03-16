import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useTheme } from '@mui/material/styles';
import { api } from '../services/api';
import { useRoadmapStore } from '../store/roadmapStore';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

interface SkillDetailDrawerProps {
  skill: RoadmapSkill | null;
  onClose: () => void;
  curriculumKey?: string;
}

const CONFIDENCE_OPTIONS = [
  { value: 1 as const, label: 'Hard', color: 'error' as const },
  { value: 2 as const, label: 'Okay', color: 'warning' as const },
  { value: 3 as const, label: 'Easy', color: 'success' as const },
];

export function SkillDetailDrawer({ skill, onClose }: SkillDetailDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ratingError, setRatingError] = useState('');
  const { updateSkillConfidence } = useRoadmapStore();

  if (!skill) {
    return (
      <Drawer anchor={isMobile ? 'bottom' : 'right'} open={false} onClose={onClose}>
        <div />
      </Drawer>
    );
  }

  async function handleConfidence(confidence: 1 | 2 | 3) {
    if (!skill) return;
    setRatingError('');
    const prev = skill.confidence;
    updateSkillConfidence(skill.skill_key, confidence);
    try {
      await api.patch(`/api/roadmap/skill/${skill.skill_key}/confidence`, { confidence });
    } catch {
      if (prev != null) updateSkillConfidence(skill.skill_key, prev);
      setRatingError('Could not save. Try again.');
    }
  }

  const hasContent = skill.practice_tip || skill.common_mistake || skill.practice_exercise;

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 380,
          maxHeight: isMobile ? '85vh' : '100vh',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
          p: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
            {skill.skill_title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
            <Chip
              label={skill.skill_category}
              size="small"
              sx={{ fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }}
            />
            {skill.completed && (
              <Chip
                label="Completed"
                size="small"
                color="success"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 2, overflowY: 'auto' }}>
        {/* Video */}
        {skill.video_youtube_id ? (
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'action.hover',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${skill.video_youtube_id}?rel=0`}
                title={skill.video_title ?? skill.skill_title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </Box>
            {skill.video_title && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {skill.video_title}
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 2,
              px: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              mb: 2.5,
            }}
          >
            <OndemandVideoIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
            <Typography variant="body2" color="text.disabled">
              No video for this skill yet
            </Typography>
          </Box>
        )}

        {/* Content sections */}
        {hasContent && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
            {skill.practice_tip && (
              <ContentSection
                icon={<LightbulbIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                title="Practice tip"
                text={skill.practice_tip}
              />
            )}
            {skill.common_mistake && (
              <ContentSection
                icon={<WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
                title="Common mistake"
                text={skill.common_mistake}
              />
            )}
            {skill.practice_exercise && (
              <ContentSection
                icon={<FitnessCenterIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                title="Today's exercise"
                text={skill.practice_exercise}
              />
            )}
          </Box>
        )}

        {/* Confidence rating */}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          How does this skill feel?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {CONFIDENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              color={skill.confidence === opt.value ? opt.color : 'default'}
              variant={skill.confidence === opt.value ? 'filled' : 'outlined'}
              onClick={() => handleConfidence(opt.value)}
              sx={{ cursor: 'pointer', flex: 1 }}
            />
          ))}
        </Box>
        {ratingError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {ratingError}
          </Alert>
        )}
      </Box>
    </Drawer>
  );
}

function ContentSection({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        {icon}
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, pl: 3 }}>
        {text}
      </Typography>
    </Box>
  );
}
