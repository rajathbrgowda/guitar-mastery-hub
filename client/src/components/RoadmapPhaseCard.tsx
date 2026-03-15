import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { alpha, useTheme } from '@mui/material/styles';
import { SkillRow } from './SkillRow';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

interface RoadmapPhaseCardProps {
  phase: RoadmapPhase;
  isCurrentPhase: boolean;
  defaultExpanded?: boolean;
  onConfidenceRate: (skillKey: string, confidence: 1 | 2 | 3) => void;
}

export function RoadmapPhaseCard({
  phase,
  isCurrentPhase,
  defaultExpanded,
  onConfidenceRate,
}: RoadmapPhaseCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded ?? isCurrentPhase);

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: '3px solid',
        borderLeftColor: isCurrentPhase ? 'primary.main' : 'divider',
        bgcolor: isCurrentPhase ? alpha(theme.palette.primary.main, 0.03) : 'background.paper',
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="overline"
                color={isCurrentPhase ? 'primary' : 'text.secondary'}
                sx={{ lineHeight: 1 }}
              >
                Phase {phase.phase_number}
              </Typography>
              {isCurrentPhase && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                  }}
                >
                  CURRENT
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {phase.completed_skills} / {phase.total_skills} skills · {phase.completion_pct}%
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setExpanded((e) => !e)}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={phase.completion_pct}
          sx={{
            height: 4,
            borderRadius: 2,
            mb: 0,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { borderRadius: 2 },
          }}
        />

        {/* Skills list */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {phase.skills.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No skills in this phase yet.
              </Typography>
            ) : (
              phase.skills.map((skill) => (
                <SkillRow key={skill.skill_id} skill={skill} onConfidenceRate={onConfidenceRate} />
              ))
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
