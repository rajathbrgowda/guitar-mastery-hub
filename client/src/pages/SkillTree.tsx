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
import { useProgressStore } from '../store/progressStore';

// Same curriculum as Roadmap — single source of truth via store
const PHASES = [
  { title: 'Foundation', color: '#ea580c', skills: 11 },
  { title: 'Beginner',   color: '#d97706', skills: 9  },
  { title: 'Intermediate', color: '#16a34a', skills: 10 },
  { title: 'Advanced',  color: '#2563eb', skills: 9  },
  { title: 'Mastery',   color: '#7c3aed', skills: 8  },
];

const SKILL_NAMES: string[][] = [
  // Phase 0
  ['Posture & hold','Tuning','Finger placement','Em chord','Am chord','D chord','G chord','C chord','Chord transitions','Down-strum','First song'],
  // Phase 1
  ['All open chords','Down-up strumming','1-min change','Power chords','Fingerpicking','Read tabs','5 full songs','Music theory basics','Metronome'],
  // Phase 2
  ['F barre chord','Bm barre chord','All barres','Pentatonic pos 1','Lead playing','CAGED intro','Keys & major scale','Palm muting','10 songs','Improvise'],
  // Phase 3
  ['All 5 penta pos','Major scale neck','Modes intro','Travis picking','Chord extensions','Play by ear','Vibrato & legato','Transcribe solo','Improvise freely'],
  // Phase 4
  ['Advanced theory','Hybrid picking','Sweep basics','Write a piece','Ear training','Record & review','Teach a concept','Unique style'],
];

interface NodeProps {
  phaseIndex: number;
  skillIndex: number;
  name: string;
  completed: boolean;
  isCurrentPhase: boolean;
  onToggle: () => void;
}

function SkillNode({ phaseIndex, name, completed, isCurrentPhase, onToggle }: NodeProps) {
  const phaseColor = PHASES[phaseIndex].color;
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
          borderColor: completed ? phaseColor : locked ? '#e5e0df' : phaseColor,
          bgcolor: completed ? phaseColor : locked ? '#f7f5f2' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locked ? 'default' : 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
          '&:hover': locked ? {} : {
            boxShadow: `0 0 0 3px ${phaseColor}33`,
            transform: 'scale(1.08)',
          },
        }}
      >
        {completed ? (
          <CheckIcon sx={{ fontSize: 20, color: '#fff' }} />
        ) : locked ? (
          <LockOutlinedIcon sx={{ fontSize: 16, color: '#c0bab9' }} />
        ) : (
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: phaseColor, opacity: 0.5 }} />
        )}
      </Box>
    </Tooltip>
  );
}

export default function SkillTree() {
  const { skills, currentPhase, loading, error, fetchProgress, toggleSkill } = useProgressStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  function isCompleted(phaseIndex: number, skillIndex: number) {
    return skills.find((s) => s.phase_index === phaseIndex && s.skill_index === skillIndex)?.completed ?? false;
  }

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
        <Typography variant="h4" fontWeight={700} gutterBottom>Skill Tree</Typography>
        <Typography variant="body1" color="text.secondary">
          Your progress across all 5 phases. Click a node to mark a skill done.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {PHASES.map((phase, pi) => {
        const phaseSkills = SKILL_NAMES[pi];
        const completedCount = phaseSkills.filter((_, si) => isCompleted(pi, si)).length;
        const pct = Math.round((completedCount / phaseSkills.length) * 100);
        const isCurrent = currentPhase === pi;
        const isLocked = currentPhase != null && pi > currentPhase;

        return (
          <Box key={pi} sx={{ mb: 4 }}>
            {/* Phase header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  bgcolor: isLocked ? '#e5e0df' : phase.color,
                }}
              />
              <Typography variant="overline" sx={{ color: isLocked ? 'text.disabled' : 'text.secondary' }}>
                Phase {pi + 1}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: isLocked ? 'text.disabled' : 'text.primary' }}>
                {phase.title}
              </Typography>
              {isCurrent && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                    {completedCount}/{phaseSkills.length}
                  </Typography>
                </Box>
              )}
              {!isCurrent && !isLocked && (
                <Typography sx={{ ml: 'auto', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'success.main', fontWeight: 700 }}>
                  {pct}% complete
                </Typography>
              )}
            </Box>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                mb: 2, height: 4, borderRadius: 2,
                bgcolor: '#f0ece9',
                '& .MuiLinearProgress-bar': { bgcolor: isLocked ? '#e5e0df' : phase.color },
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
              {phaseSkills.map((name, si) => (
                <SkillNode
                  key={si}
                  phaseIndex={pi}
                  skillIndex={si}
                  name={name}
                  completed={isCompleted(pi, si)}
                  isCurrentPhase={pi <= currentPhase}
                  onToggle={() => toggleSkill(pi, si, !isCompleted(pi, si))}
                />
              ))}
            </Box>

            {/* Connector line to next phase */}
            {pi < PHASES.length - 1 && (
              <Box sx={{ ml: 3, mt: 1.5, width: 2, height: 24, bgcolor: '#e5e0df' }} />
            )}
          </Box>
        );
      })}

      <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" size="small" onClick={() => navigate('/app/roadmap')}>
          View full Roadmap
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {[{ label: 'Completed', color: PHASES[currentPhase].color, filled: true }, { label: 'Available', color: PHASES[currentPhase].color, filled: false }, { label: 'Locked', color: '#e5e0df', filled: true }].map((leg) => (
            <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: leg.filled ? leg.color : '#fff', border: `2px solid ${leg.color}` }} />
              <Typography variant="caption" color="text.secondary">{leg.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
