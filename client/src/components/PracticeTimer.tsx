import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const RADIUS = 54;
const STROKE = 6;
const SVG_SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PracticeTimerProps {
  durationMin: number;
  status: 'running' | 'paused' | 'idle';
  onComplete: (elapsedSec: number) => void;
  onPause: () => void;
  onResume: () => void;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PracticeTimer({
  durationMin,
  status,
  onComplete,
  onPause,
  onResume,
}: PracticeTimerProps) {
  const theme = useTheme();
  const totalSec = durationMin * 60;
  const [remaining, setRemaining] = useState(totalSec);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when duration changes (new item)
  useEffect(() => {
    setRemaining(totalSec);
    elapsedRef.current = 0;
  }, [totalSec]);

  // Tick
  useEffect(() => {
    if (status !== 'running') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        elapsedRef.current += 1;
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onComplete(elapsedRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, onComplete]);

  const elapsed = totalSec - remaining;
  const progress = totalSec > 0 ? elapsed / totalSec : 0; // 0 → 1 as time passes
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const primaryColor = theme.palette.primary.main;
  const trackColor = theme.palette.action.hover;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          transform: { xs: 'scale(0.8)', sm: 'scale(1)' },
          transformOrigin: 'top center',
          mb: { xs: -2, sm: 0 },
        }}
      >
        <Box sx={{ position: 'relative', width: SVG_SIZE, height: SVG_SIZE }}>
          <svg width={SVG_SIZE} height={SVG_SIZE} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={trackColor}
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={primaryColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>

          {/* Time remaining text in centre */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
            >
              {fmt(remaining)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              remaining
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Pause / Resume */}
      <IconButton
        onClick={status === 'running' ? onPause : onResume}
        size="large"
        aria-label={status === 'running' ? 'Pause timer' : 'Resume timer'}
        sx={{ bgcolor: 'action.hover' }}
      >
        {status === 'running' ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    </Box>
  );
}
