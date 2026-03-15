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
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useProgressStore } from '../store/progressStore';
import type { Phase } from '../types/progress';

const CURRICULUM: Phase[] = [
  {
    title: 'Foundation',
    subtitle: 'Get comfortable with the guitar',
    skills: [
      { name: 'Proper posture and guitar hold' },
      { name: 'Tune the guitar by ear and with a tuner' },
      { name: 'Left-hand finger placement and pressure' },
      { name: 'Basic chord: Em' },
      { name: 'Basic chord: Am' },
      { name: 'Basic chord: D' },
      { name: 'Basic chord: G' },
      { name: 'Basic chord: C' },
      { name: 'Smooth chord transitions (any two chords)' },
      { name: 'Simple down-strum rhythm pattern' },
      { name: 'Play a full song with 2–3 chords' },
    ],
  },
  {
    title: 'Beginner',
    subtitle: 'Build your first repertoire',
    skills: [
      { name: 'All open chords fluently (A, B7, E, F, G)' },
      { name: 'Down-up strumming patterns' },
      { name: 'The 1-minute chord change exercise' },
      { name: 'Power chords (E and A shape)' },
      { name: 'Basic fingerpicking pattern (p-i-m-a)' },
      { name: 'Read basic chord charts and tabs' },
      { name: 'Play 5 full songs from start to finish' },
      { name: 'Understand basic music theory: notes on fretboard' },
      { name: 'Use a metronome consistently' },
    ],
  },
  {
    title: 'Intermediate',
    subtitle: 'Expand your technique and theory',
    skills: [
      { name: 'F barre chord (E shape)' },
      { name: 'Bm barre chord (A shape)' },
      { name: 'All barre chords across the neck' },
      { name: 'Pentatonic minor scale (position 1)' },
      { name: 'Basic lead playing and string bending' },
      { name: 'CAGED system introduction' },
      { name: 'Understand keys and the major scale' },
      { name: 'Palm muting technique' },
      { name: 'Play 10 songs including barre chord songs' },
      { name: 'Basic improvisation over a backing track' },
    ],
  },
  {
    title: 'Advanced',
    subtitle: 'Develop your musical voice',
    skills: [
      { name: 'All 5 pentatonic scale positions' },
      { name: 'Major scale across the neck' },
      { name: 'Modes introduction (Dorian, Mixolydian)' },
      { name: 'Advanced fingerpicking (Travis picking)' },
      { name: 'Chord extensions (maj7, m7, dom7)' },
      { name: 'Play by ear — simple melodies' },
      { name: 'Vibrato and legato techniques' },
      { name: 'Transcribe a guitar solo' },
      { name: 'Improvise freely over common progressions' },
    ],
  },
  {
    title: 'Mastery',
    subtitle: 'Express yourself fully',
    skills: [
      { name: 'Advanced music theory (harmony, voice leading)' },
      { name: 'Hybrid picking technique' },
      { name: 'Sweep picking basics' },
      { name: 'Composition: write an original piece' },
      { name: 'Advanced ear training — chord recognition' },
      { name: 'Record and critically review your playing' },
      { name: 'Teach a beginner concept to someone else' },
      { name: 'Develop a unique playing style' },
    ],
  },
];

function PhaseCard({
  phase,
  phaseIndex,
  isCurrent,
  isExpanded,
  onToggle,
  onSetCurrent,
}: {
  phase: Phase;
  phaseIndex: number;
  isCurrent: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSetCurrent: () => void;
}) {
  const { skills, toggleSkill } = useProgressStore();

  const phaseSkills = skills.filter((s) => s.phase_index === phaseIndex);
  const completedCount = phaseSkills.filter((s) => s.completed).length;
  const totalSkills = phase.skills.length;
  const progress = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
  const allDone = completedCount === totalSkills;

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
              {phase.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {phase.subtitle}
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
                key={i}
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
                      {skill.name}
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
  const { currentPhase, loading, error, fetchProgress, setPhase } = useProgressStore();
  const [expanded, setExpanded] = useState<number>(0);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    // Auto-expand current phase on load
    if (!loading) setExpanded(currentPhase);
  }, [loading, currentPhase]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress color="primary" />
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
          5-phase curriculum from total beginner to mastery. Check off skills as you learn them.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {CURRICULUM.map((phase, i) => (
        <PhaseCard
          key={i}
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
