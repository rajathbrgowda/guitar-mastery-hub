import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useProgressStore } from '../store/progressStore';
import { useCurriculumStore } from '../store/curriculumStore';
import { useUserStore } from '../store/userStore';
import type { CurriculumPhase } from '@gmh/shared/types/curriculum';

function PhaseCard({
  phase,
  phaseIndex,
  isCurrent,
  isExpanded,
  onToggle,
  onSetCurrent,
}: {
  phase: CurriculumPhase;
  phaseIndex: number;
  isCurrent: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSetCurrent: () => void;
}) {
  const { skills, toggleSkill } = useProgressStore();

  const phaseSkills = skills.filter((s) => s.phase_index === phaseIndex);
  const totalSkills = phase.skills.length;
  const completedCount = phaseSkills.filter((s) => s.completed).length;
  const progress = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
  const allDone = completedCount === totalSkills && totalSkills > 0;

  function isSkillCompleted(skillIndex: number) {
    return phaseSkills.find((s) => s.skill_index === skillIndex)?.completed ?? false;
  }

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: isCurrent ? '3px solid' : '3px solid transparent',
        borderLeftColor: isCurrent ? 'primary.main' : 'transparent',
      }}
    >
      <CardContent sx={{ pb: isExpanded ? 1 : '16px !important' }}>
        {/* Header row */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
          onClick={onToggle}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                Phase {phaseIndex + 1}
              </Typography>
              {isCurrent && (
                <Chip
                  label="current"
                  size="small"
                  color="primary"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {allDone && (
                <Chip
                  label="complete"
                  size="small"
                  color="success"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {phase.phase_title}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right', minWidth: 80 }}>
            <Typography
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: '0.9rem' }}
            >
              {completedCount}/{totalSkills}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              skills
            </Typography>
          </Box>

          {isExpanded ? (
            <KeyboardArrowUpIcon sx={{ color: 'text.secondary' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
          )}
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 1.5, height: 5, borderRadius: 4, bgcolor: '#f0ece9' }}
        />

        {/* Skill checklist */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2 }}>
            {phase.skills.map((skill, i) => (
              <Box
                key={skill.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 0.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSkillCompleted(i)}
                      onChange={(e) => toggleSkill(phaseIndex, i, e.target.checked)}
                      icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />}
                      checkedIcon={
                        <CheckCircleOutlineIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      }
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: isSkillCompleted(i) ? 'line-through' : 'none',
                        color: isSkillCompleted(i) ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {skill.title}
                    </Typography>
                  }
                  sx={{ m: 0, flex: 1 }}
                />
              </Box>
            ))}

            {!isCurrent && (
              <Box sx={{ mt: 2, pb: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetCurrent();
                  }}
                >
                  Set as current phase
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function Roadmap() {
  const {
    currentPhase,
    loading: progressLoading,
    error: progressError,
    fetchProgress,
    setPhase,
  } = useProgressStore();
  const { activeCurriculum, isLoadingDetail, detailError, fetchCurriculumDetail } =
    useCurriculumStore();
  const { profile } = useUserStore();
  const [expanded, setExpanded] = useState<number>(0);

  const curriculumKey = profile?.selected_curriculum_key ?? 'best_of_all';

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchCurriculumDetail(curriculumKey);
  }, [curriculumKey, fetchCurriculumDetail]);

  useEffect(() => {
    // Auto-expand current phase on load
    if (!progressLoading) setExpanded(currentPhase);
  }, [progressLoading, currentPhase]);

  const loading = progressLoading || isLoadingDetail;
  const error = progressError ?? detailError;

  if (loading) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Roadmap
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {activeCurriculum
            ? `${activeCurriculum.name} — ${activeCurriculum.phases.length}-phase curriculum. Check off skills as you learn them.`
            : 'Check off skills as you learn them.'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!activeCurriculum && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Select a curriculum in Settings to load your roadmap.
        </Alert>
      )}

      {activeCurriculum?.phases.map((phase, i) => (
        <PhaseCard
          key={phase.phase_number}
          phase={phase}
          phaseIndex={i}
          isCurrent={currentPhase === i}
          isExpanded={expanded === i}
          onToggle={() => setExpanded(expanded === i ? -1 : i)}
          onSetCurrent={() => setPhase(i)}
        />
      ))}
    </Box>
  );
}
