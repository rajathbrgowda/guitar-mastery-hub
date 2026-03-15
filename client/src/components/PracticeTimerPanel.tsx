import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useTheme } from '@mui/material/styles';
import type { QuickLogPayload } from '@gmh/shared/types';
import { formatTime } from '../utils/formatTime';

interface PracticeTimerPanelProps {
  onSubmit: (payload: QuickLogPayload) => Promise<void>;
  todayStr: string;
}

type TimerPhase = 'running' | 'ended';

export default function PracticeTimerPanel({ onSubmit, todayStr }: PracticeTimerPanelProps) {
  const theme = useTheme();
  const [phase, setPhase] = useState<TimerPhase>('running');
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick
  useEffect(() => {
    if (running && phase === 'running') {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase]);

  // Warn on accidental navigation mid-session
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (phase === 'running') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  function handleStop() {
    setRunning(false);
    setPhase('ended');
  }

  async function handleSubmit() {
    const durationMin = Math.max(1, Math.round(elapsed / 60));
    setSubmitting(true);
    await onSubmit({
      date: todayStr,
      duration_min: durationMin,
      notes: notes || undefined,
      confidence: confidence ?? undefined,
    });
    setSubmitting(false);
  }

  if (phase === 'ended') {
    const durationMin = Math.max(1, Math.round(elapsed / 60));
    return (
      <Box>
        <Typography variant="overline" color="text.secondary">
          Session complete
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            {durationMin} min
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTime(elapsed)}
          </Typography>
        </Box>

        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          How was this session?{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            (optional)
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {(
            [
              { value: 3, label: 'Easy', color: 'success' },
              { value: 2, label: 'Okay', color: 'warning' },
              { value: 1, label: 'Hard', color: 'error' },
            ] as const
          ).map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => setConfidence(confidence === opt.value ? null : opt.value)}
              variant={confidence === opt.value ? 'filled' : 'outlined'}
              color={confidence === opt.value ? opt.color : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        <TextField
          label="Notes"
          multiline
          rows={2}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          size="small"
          placeholder="What went well? What to work on next time?"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Logging...' : 'Log session'}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        Session Timer
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '2.5rem',
            fontWeight: 600,
            minWidth: 110,
            color: running ? theme.palette.primary.main : 'text.secondary',
          }}
        >
          {formatTime(elapsed)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? 'Pause' : 'Resume'}
          </Button>
          <IconButton onClick={handleStop} title="Stop and log" color="default">
            <StopIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
