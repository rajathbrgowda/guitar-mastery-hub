import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { format } from 'date-fns';
import { usePracticeStore } from '../store/practiceStore';
import { PracticeSection } from '../types/practice';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const QUICK_DURATIONS = [15, 30, 45, 60];

export default function Practice() {
  const { sessions, loading, error, fetchSessions, logSession } = usePracticeStore();

  // Timer state
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Log form state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationMin, setDurationMin] = useState('');
  const [sections, setSections] = useState<PracticeSection[]>([]);
  const [sectionName, setSectionName] = useState('');
  const [sectionDur, setSectionDur] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchSessions({ from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') });
  }, [fetchSessions]);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function handleReset() {
    setRunning(false);
    setElapsed(0);
  }

  function handleStopAndUse() {
    setRunning(false);
    setDurationMin(String(Math.max(1, Math.round(elapsed / 60))));
  }

  function addSection() {
    const dur = parseInt(sectionDur);
    if (!sectionName.trim() || !dur || dur < 1) return;
    setSections((s) => [...s, { name: sectionName.trim(), duration_min: dur }]);
    setSectionName('');
    setSectionDur('');
  }

  async function handleSubmit() {
    const dur = parseInt(durationMin);
    if (!date || !dur || dur < 1) { setSubmitError('Date and duration are required.'); return; }
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    try {
      await logSession({ date, duration_min: dur, sections: sections.length ? sections : undefined, notes: notes || undefined });
      setDurationMin('');
      setSections([]);
      setNotes('');
      setElapsed(0);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      setSubmitError('Failed to log session. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Practice</Typography>

      {/* Timer */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Session Timer</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
            <Typography
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '2.5rem', fontWeight: 600, minWidth: 110 }}
            >
              {formatTime(elapsed)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => setRunning((r) => !r)}
              >
                {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}
              </Button>
              <IconButton onClick={handleReset} disabled={elapsed === 0 && !running} title="Reset">
                <RestartAltIcon />
              </IconButton>
              {elapsed > 0 && (
                <Button variant="outlined" size="small" onClick={handleStopAndUse}>
                  Use time
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Log form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Log Session</Typography>

          {/* Quick duration */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, mb: 2, flexWrap: 'wrap' }}>
            {QUICK_DURATIONS.map((d) => (
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

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{ width: 160 }}
            />
            <TextField
              label="Duration (min)"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              size="small"
              sx={{ width: 140 }}
              inputProps={{ min: 1 }}
            />
          </Box>

          {/* Section builder */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
            Sections <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
          </Typography>

          {sections.map((sec, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Chip label={`${sec.name} — ${sec.duration_min} min`} size="small" />
              <IconButton size="small" onClick={() => setSections((s) => s.filter((_, j) => j !== i))}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              size="small"
              sx={{ width: 180 }}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
            />
            <TextField
              placeholder="Min"
              type="number"
              value={sectionDur}
              onChange={(e) => setSectionDur(e.target.value)}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ min: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
            />
            <IconButton onClick={addSection} size="small" color="primary" title="Add section">
              <AddIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

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

          {submitError && <Alert severity="error" sx={{ mb: 1.5 }}>{submitError}</Alert>}
          {submitSuccess && <Alert severity="success" sx={{ mb: 1.5 }}>Session logged!</Alert>}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Logging...' : 'Log session'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent sessions */}
      <Typography variant="h6" fontWeight={600} gutterBottom>Last 30 days</Typography>

      {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && sessions.length === 0 && (
        <Typography variant="body2" color="text.secondary">No sessions yet. Log your first one above.</Typography>
      )}

      {sessions.map((s) => (
        <Card key={s.id} sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {format(new Date(s.date + 'T12:00:00'), 'EEE, MMM d')}
                </Typography>
                {s.notes && (
                  <Typography variant="caption" color="text.secondary">{s.notes}</Typography>
                )}
                {s.sections && s.sections.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {s.sections.map((sec, i) => (
                      <Chip key={i} label={`${sec.name} ${sec.duration_min}m`} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Box>
              <Typography
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, color: 'primary.main', ml: 2, whiteSpace: 'nowrap' }}
              >
                {s.duration_min} min
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
