import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { usePracticePlanStore } from '../store/practicePlanStore';
import { PracticeItem } from './PracticeItem';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ready to start',
  in_progress: 'In progress',
  completed: 'Completed',
  skipped: 'Skipped today',
};

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  skipped: 'error',
};

export function TodaysPractice() {
  const { todaysPlan, isLoading, error, noplan, fetchTodaysPlan, completeItem, skipPlan } =
    usePracticePlanStore();

  useEffect(() => {
    fetchTodaysPlan();
  }, [fetchTodaysPlan]);

  if (isLoading) return <PracticeLoadingSkeleton />;

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (noplan || !todaysPlan) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          No practice plan yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your personalized plan will appear here once you've selected a curriculum and set your
          daily goal in Settings.
        </Typography>
        <Button variant="outlined" size="small" href="/app/settings">
          Go to Settings
        </Button>
      </Paper>
    );
  }

  const completedCount = todaysPlan.items.filter((i) => i.completed).length;
  const totalCount = todaysPlan.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleComplete = async (itemId: string) => {
    await completeItem(itemId);
  };

  const handleSkip = async () => {
    await skipPlan();
  };

  const isCompleted = todaysPlan.status === 'completed';
  const isSkipped = todaysPlan.status === 'skipped';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Today's Practice
          </Typography>
          <Chip
            label={STATUS_LABEL[todaysPlan.status]}
            color={STATUS_COLOR[todaysPlan.status]}
            size="small"
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {todaysPlan.total_duration_min} min total
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {completedCount} of {totalCount} done
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isCompleted ? 'success' : 'primary'}
          sx={{ borderRadius: 1, height: 6 }}
        />
      </Box>

      {/* Celebration banner */}
      {isCompleted && (
        <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Practice complete! You showed up today. 🎸
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Log your session in Practice to track your time.
          </Typography>
        </Alert>
      )}

      {/* Skipped state */}
      {isSkipped && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          You skipped today's plan. That's okay — come back tomorrow.
        </Alert>
      )}

      {/* Practice items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {todaysPlan.items.map((item, idx) => (
          <Box key={item.id}>
            {idx > 0 && idx === 1 && (
              <Divider sx={{ my: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Main focus
                </Typography>
              </Divider>
            )}
            <PracticeItem
              item={item}
              onComplete={handleComplete}
              disabled={isCompleted || isSkipped}
            />
          </Box>
        ))}
      </Box>

      {/* Skip action */}
      {!isCompleted && !isSkipped && (
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<SkipNextIcon />}
            onClick={handleSkip}
            sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
          >
            Skip today's plan
          </Button>
        </Box>
      )}
    </Box>
  );
}

function PracticeLoadingSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={140} />
        <Skeleton variant="rounded" width={80} height={20} />
      </Box>
      <Skeleton variant="rounded" height={6} sx={{ mb: 2 }} />
      {[0, 1, 2].map((i) => (
        <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1, display: 'flex', gap: 1.5 }}>
          <Skeleton variant="rectangular" width={20} height={20} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Skeleton variant="rounded" width={100} height={56} />
        </Paper>
      ))}
    </Box>
  );
}
