import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTheme } from '@mui/material/styles';
import { useProgressStore } from '../store/progressStore';
import { useCurriculumStore } from '../store/curriculumStore';
import { useUserStore } from '../store/userStore';

interface NodeProps {
  phaseIndex: number;
  skillIndex: number;
  name: string;
  completed: boolean;
  isCurrentPhase: boolean;
  onToggle: () => void;
}

function SkillNode({ phaseIndex, name, completed, isCurrentPhase, onToggle }: NodeProps) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const locked = !isCurrentPhase && !completed && phaseIndex > 0;

  return (
    <Tooltip title={locked ? 'Complete previous phases first' : name} placement="top" arrow>
      <Box
        onClick={locked ? undefined : onToggle}
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: completed ? primaryColor : locked ? '#e5e0df' : primaryColor,
          bgcolor: completed ? primaryColor : locked ? '#f7f5f2' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locked ? 'default' : 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
          '&:hover': locked
            ? {}
            : {
                boxShadow: `0 0 0 3px ${primaryColor}33`,
                transform: 'scale(1.08)',
              },
        }}
      >
        {completed ? (
          <CheckIcon sx={{ fontSize: 20, color: '#fff' }} />
        ) : locked ? (
          <LockOutlinedIcon sx={{ fontSize: 16, color: '#c0bab9' }} />
        ) : (
          <Box
            sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: primaryColor, opacity: 0.5 }}
          />
        )}
      </Box>
    </Tooltip>
  );
}

export default function SkillTree() {
  const {
    skills,
    currentPhase,
    loading: progressLoading,
    error: progressError,
    fetchProgress,
    toggleSkill,
  } = useProgressStore();
  const { activeCurriculum, isLoadingDetail, detailError, fetchCurriculumDetail } =
    useCurriculumStore();
  const { profile } = useUserStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  const curriculumKey = profile?.selected_curriculum_key ?? 'best_of_all';

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchCurriculumDetail(curriculumKey);
  }, [curriculumKey, fetchCurriculumDetail]);

  function isCompleted(phaseIndex: number, skillIndex: number) {
    return (
      skills.find((s) => s.phase_index === phaseIndex && s.skill_index === skillIndex)?.completed ??
      false
    );
  }

  const loading = progressLoading || isLoadingDetail;
  const error = progressError ?? detailError;
  const phases = activeCurriculum?.phases ?? [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Skill Tree
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your progress across all phases. Click a node to mark a skill done.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {phases.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Select a curriculum in Settings to see your skill tree.
        </Alert>
      )}

      {phases.map((phase, pi) => {
        const phaseSkillCount = phase.skills.length;
        const completedCount = phase.skills.filter((_, si) => isCompleted(pi, si)).length;
        const pct = phaseSkillCount > 0 ? Math.round((completedCount / phaseSkillCount) * 100) : 0;
        const isCurrent = currentPhase === pi;
        const isLocked = currentPhase != null && pi > currentPhase;

        return (
          <Box key={phase.phase_number} sx={{ mb: 4 }}>
            {/* Phase header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: isLocked ? '#e5e0df' : primaryColor,
                }}
              />
              <Typography
                variant="overline"
                sx={{ color: isLocked ? 'text.disabled' : 'text.secondary' }}
              >
                Phase {pi + 1}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: isLocked ? 'text.disabled' : 'text.primary' }}
              >
                {phase.phase_title}
              </Typography>
              {isCurrent && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                    }}
                  >
                    {completedCount}/{phaseSkillCount}
                  </Typography>
                </Box>
              )}
              {!isCurrent && !isLocked && (
                <Typography
                  sx={{
                    ml: 'auto',
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.75rem',
                    color: 'success.main',
                    fontWeight: 700,
                  }}
                >
                  {pct}% complete
                </Typography>
              )}
            </Box>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                mb: 2,
                height: 4,
                borderRadius: 2,
                bgcolor: '#f0ece9',
                '& .MuiLinearProgress-bar': { bgcolor: isLocked ? '#e5e0df' : primaryColor },
              }}
            />

            {/* Skill nodes grid */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 1.5 },
                opacity: isLocked ? 0.45 : 1,
              }}
            >
              {phase.skills.map((skill, si) => (
                <SkillNode
                  key={skill.key}
                  phaseIndex={pi}
                  skillIndex={si}
                  name={skill.title}
                  completed={isCompleted(pi, si)}
                  isCurrentPhase={pi <= currentPhase}
                  onToggle={() => toggleSkill(pi, si, !isCompleted(pi, si))}
                />
              ))}
            </Box>

            {/* Connector line to next phase */}
            {pi < phases.length - 1 && (
              <Box sx={{ ml: 3, mt: 1.5, width: 2, height: 24, bgcolor: '#e5e0df' }} />
            )}
          </Box>
        );
      })}

      {phases.length > 0 && (
        <Box
          sx={{
            mt: 2,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button variant="outlined" size="small" onClick={() => navigate('/app/roadmap')}>
            View full Roadmap
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'Completed', color: primaryColor, filled: true },
              { label: 'Available', color: primaryColor, filled: false },
              { label: 'Locked', color: '#e5e0df', filled: true },
            ].map((leg) => (
              <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: leg.filled ? leg.color : '#fff',
                    border: `2px solid ${leg.color}`,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {leg.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
