import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { SkillInsight } from '@gmh/shared/types/analytics';

interface SkillFocusRowProps {
  weakSkills: SkillInsight[];
  strongSkills: SkillInsight[];
}

// Confidence 1=hard(red) 2=okay(amber) 3=easy(green) null=gray
function confidenceColor(avg: number | null): string {
  if (avg === null) return '#9e9e9e';
  if (avg < 1.5) return '#ef4444'; // red
  if (avg < 2.3) return '#f59e0b'; // amber
  return '#22c55e'; // green
}

function confidenceLabel(avg: number | null): string {
  if (avg === null) return 'not rated';
  if (avg < 1.5) return 'hard';
  if (avg < 2.3) return 'okay';
  return 'easy';
}

function SkillChip({ skill }: { skill: SkillInsight }) {
  const color = confidenceColor(skill.avg_confidence);
  const label = confidenceLabel(skill.avg_confidence);

  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
            {skill.skill_title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: '0.6rem', color: alpha(color, 0.85), fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
      }
      size="small"
      variant="outlined"
      sx={{
        borderColor: color,
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        bgcolor: alpha(color, 0.06),
        height: 28,
        flexShrink: 0,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

export function SkillFocusRow({ weakSkills, strongSkills }: SkillFocusRowProps) {
  const allSkills = [...weakSkills, ...strongSkills];
  if (allSkills.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.6rem',
          fontWeight: 600,
          display: 'block',
          mb: 1,
        }}
      >
        Skill radar
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {weakSkills.map((s) => (
          <SkillChip key={s.skill_id} skill={s} />
        ))}
        {strongSkills.map((s) => (
          <SkillChip key={s.skill_id} skill={s} />
        ))}
      </Box>
    </Box>
  );
}
