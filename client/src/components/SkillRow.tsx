import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

const CONFIDENCE_COLORS: Record<number, { label: string; color: 'success' | 'warning' | 'error' }> =
  {
    3: { label: 'Easy', color: 'success' },
    2: { label: 'Okay', color: 'warning' },
    1: { label: 'Hard', color: 'error' },
  };

interface SkillRowProps {
  skill: RoadmapSkill;
  onClick?: () => void;
}

export function SkillRow({ skill, onClick }: SkillRowProps) {
  const conf = skill.confidence != null ? CONFIDENCE_COLORS[skill.confidence] : null;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 1,
        minHeight: 48,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {skill.completed ? (
        <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'action.disabled', flexShrink: 0 }} />
      )}

      <Typography
        variant="body2"
        noWrap
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: skill.completed ? 400 : 500,
          color: skill.completed ? 'text.secondary' : 'text.primary',
          textDecoration: skill.completed ? 'line-through' : 'none',
        }}
      >
        {skill.skill_title}
      </Typography>

      {skill.video_youtube_id && (
        <OndemandVideoIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
      )}

      <Chip
        label={skill.skill_category}
        size="small"
        sx={{
          fontSize: '0.6rem',
          height: 20,
          textTransform: 'capitalize',
          flexShrink: 0,
        }}
      />

      {conf && (
        <Chip
          label={conf.label}
          size="small"
          color={conf.color}
          variant="outlined"
          sx={{ fontSize: '0.6rem', height: 20, flexShrink: 0 }}
        />
      )}
    </Box>
  );
}
