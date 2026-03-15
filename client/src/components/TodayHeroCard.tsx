import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { PracticeSession } from '../types/practice';
import type { QuickLogPayload } from '@gmh/shared/types';
import PracticeTimerPanel from './PracticeTimerPanel';

type HeroMode = 'choose' | 'timer' | 'manual';

interface TodayHeroCardProps {
  todaySessions: PracticeSession[];
  todayStr: string;
  onLog: (payload: QuickLogPayload) => Promise<void>;
}

export default function TodayHeroCard({ todaySessions, todayStr, onLog }: TodayHeroCardProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<HeroMode>('choose');
  const [showAnother, setShowAnother] = useState(false);

  // Manual log form state
  const [durationMin, setDurationMin] = useState('');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const hasTodaySession = todaySessions.length > 0;
  const todayTotal = todaySessions.reduce((s, r) => s + r.duration_min, 0);

  async function handleManualSubmit() {
    const dur = parseInt(durationMin, 10);
    if (isNaN(dur) || dur < 1) {
      setSubmitError('Enter a valid duration.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onLog({
        date: todayStr,
        duration_min: dur,
        notes: notes || undefined,
        confidence: confidence ?? undefined,
      });
      setDurationMin('');
      setNotes('');
      setConfidence(null);
      setMode('choose');
      setShowAnother(false);
    } catch {
      setSubmitError('Failed to log session. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTimerSubmit(payload: QuickLogPayload) {
    await onLog(payload);
    setMode('choose');
    setShowAnother(false);
  }

  // Already practiced today — show summary unless logging another
  if (hasTodaySession && !showAnother && mode === 'choose') {
    return (
      <Card
        sx={{
          mb: 3,
          borderLeft: '3px solid',
          borderLeftColor: 'success.main',
          background: alpha(theme.palette.success.main, 0.04),
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="overline" color="success.main">
              Practiced today
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'success.main',
            }}
          >
            {todayTotal} min
          </Typography>
          {todaySessions[todaySessions.length - 1]?.confidence != null && (
            <Box sx={{ mt: 0.5 }}>
              {(() => {
                const c = todaySessions[todaySessions.length - 1].confidence;
                return (
                  <Chip
                    label={c === 3 ? 'Easy' : c === 2 ? 'Okay' : 'Hard'}
                    size="small"
                    color={c === 3 ? 'success' : c === 2 ? 'warning' : 'error'}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                );
              })()}
            </Box>
          )}
          <Button
            size="small"
            variant="text"
            sx={{ mt: 1.5, p: 0, textTransform: 'none', fontSize: '0.8rem' }}
            onClick={() => setShowAnother(true)}
          >
            Log another session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        borderLeft: '3px solid',
        borderLeftColor: 'primary.main',
      }}
    >
      <CardContent>
        {mode === 'choose' && (
          <>
            <Typography variant="overline" color="text.secondary">
              {hasTodaySession ? 'Log another session' : "Today's practice"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {hasTodaySession ? 'Add more practice time.' : 'Start a timer or log manually.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<TimerOutlinedIcon />}
                onClick={() => setMode('timer')}
              >
                Start Timer
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditNoteIcon />}
                onClick={() => setMode('manual')}
              >
                Log Manually
              </Button>
            </Box>
          </>
        )}

        {mode === 'timer' && (
          <>
            <PracticeTimerPanel onSubmit={handleTimerSubmit} todayStr={todayStr} />
            <Button
              size="small"
              variant="text"
              sx={{
                mt: 1,
                p: 0,
                textTransform: 'none',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
              onClick={() => setMode('choose')}
            >
              Cancel
            </Button>
          </>
        )}

        {mode === 'manual' && (
          <>
            <Typography variant="overline" color="text.secondary">
              Log Session
            </Typography>

            {/* Quick duration chips */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, mb: 2, flexWrap: 'wrap' }}>
              {[15, 30, 45, 60].map((d) => (
                <Chip
                  key={d}
                  label={`${d} min`}
                  onClick={() => setDurationMin(String(d))}
                  variant={durationMin === String(d) ? 'filled' : 'outlined'}
                  color={durationMin === String(d) ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>

            <TextField
              label="Duration (min)"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              size="small"
              sx={{ width: 140, mb: 2 }}
              inputProps={{ min: 1 }}
            />

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

            {submitError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {submitError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleManualSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {submitting ? 'Logging...' : 'Log session'}
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setMode('choose');
                  setShowAnother(false);
                }}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
