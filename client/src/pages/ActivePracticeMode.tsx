import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { usePracticePlanStore } from '../store/practicePlanStore';
import { usePracticeModeStore } from '../store/practiceModeStore';
import { PracticeTimer } from '../components/PracticeTimer';
import { ConfidenceRating } from '../components/ConfidenceRating';
import type { ConfidenceRating as Rating } from '@gmh/shared/types/practice-plan';

// ── Session complete screen ────────────────────────────────────────────────

function SessionComplete({
  itemsDone,
  totalMin,
  onBack,
}: {
  itemsDone: number;
  totalMin: number;
  onBack: () => void;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: 3,
        textAlign: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.success.main, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 44, color: 'success.main' }} />
      </Box>

      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          Session done!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {itemsDone} {itemsDone === 1 ? 'skill' : 'skills'} · {totalMin} min
        </Typography>
      </Box>

      <Chip
        icon={<LocalFireDepartmentIcon sx={{ fontSize: '1rem !important' }} />}
        label="Keep your streak going"
        color="warning"
        variant="filled"
        sx={{ fontWeight: 700 }}
      />

      <Button variant="contained" size="large" onClick={onBack} sx={{ mt: 1, minWidth: 200 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}

// ── Active practice page ───────────────────────────────────────────────────

export default function ActivePracticeMode() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { todaysPlan, fetchTodaysPlan } = usePracticePlanStore();
  const {
    currentItemIndex,
    timerStatus,
    startSession,
    pauseTimer,
    resumeTimer,
    timerComplete,
    markDone,
    submitRating,
    skipItem,
    resetSession,
  } = usePracticeModeStore();

  const hasStarted = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!todaysPlan) fetchTodaysPlan();
  }, [fetchTodaysPlan, todaysPlan]);

  useEffect(() => {
    if (todaysPlan && !hasStarted.current) {
      hasStarted.current = true;
      startSession();
    }
  }, [todaysPlan, startSession]);

  // Reset store on unmount so next visit starts fresh
  useEffect(() => () => resetSession(), [resetSession]);

  function handleBack() {
    resetSession();
    navigate('/app');
  }

  // ── No plan ──
  if (!todaysPlan || todaysPlan.items.length === 0) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 8 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          No practice plan today
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate a plan from the Dashboard first.
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const items = todaysPlan.items;
  const totalItems = items.length;

  // ── Session complete ──
  if (timerStatus === 'done' || currentItemIndex >= totalItems) {
    const doneSoFar = Math.min(currentItemIndex, totalItems);
    const totalMin = items.slice(0, doneSoFar).reduce((s, i) => s + i.duration_min, 0);
    return <SessionComplete itemsDone={doneSoFar} totalMin={totalMin} onBack={handleBack} />;
  }

  const item = items[currentItemIndex];

  async function handleRate(rating: Rating) {
    await submitRating(item.id, rating, elapsedRef.current, totalItems);
    elapsedRef.current = 0;
  }

  function handleSkip() {
    elapsedRef.current = 0;
    skipItem(totalItems);
  }

  const progressPct = Math.round((currentItemIndex / totalItems) * 100);

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: 'auto',
        minHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <IconButton onClick={handleBack} size="small" aria-label="Exit practice">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {currentItemIndex + 1} of {totalItems}
          </Typography>
          {/* Progress bar */}
          <Box
            sx={{
              width: 120,
              height: 3,
              bgcolor: 'action.hover',
              borderRadius: 2,
              mt: 0.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progressPct}%`,
                bgcolor: 'primary.main',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
        <Box sx={{ width: 32 }} /> {/* spacer to balance header */}
      </Box>

      {/* Skill info */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Chip
          label={item.skill_category}
          size="small"
          sx={{ mb: 1, textTransform: 'capitalize', fontSize: '0.7rem' }}
        />
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1, lineHeight: 1.2 }}>
          {item.skill_title}
        </Typography>
        {item.practice_tip && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 380, mx: 'auto', lineHeight: 1.5 }}
          >
            {item.practice_tip}
          </Typography>
        )}
      </Box>

      {/* Timer */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <PracticeTimer
          durationMin={item.duration_min}
          status={
            timerStatus === 'rating' ? 'paused' : (timerStatus as 'running' | 'paused' | 'idle')
          }
          onComplete={(sec) => {
            elapsedRef.current = sec;
            timerComplete(item.id, sec);
          }}
          onPause={pauseTimer}
          onResume={resumeTimer}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<SkipNextIcon />}
          onClick={handleSkip}
          sx={{ flex: 1 }}
        >
          Skip
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={() => {
            const sec = elapsedRef.current;
            markDone(item.id, sec);
          }}
          sx={{ flex: 2 }}
        >
          Done
        </Button>
      </Box>

      {/* Confidence overlay */}
      {timerStatus === 'rating' && (
        <ConfidenceRating skillTitle={item.skill_title} onRate={handleRate} />
      )}
    </Box>
  );
}
