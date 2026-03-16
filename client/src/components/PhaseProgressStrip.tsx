import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

interface PhaseProgressStripProps {
  phases: RoadmapPhase[];
  currentPhase: number;
  isSongFirst: boolean;
  onDotClick: (phaseNumber: number) => void;
}

export function PhaseProgressStrip({
  phases,
  currentPhase,
  isSongFirst,
  onDotClick,
}: PhaseProgressStripProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const divider = theme.palette.divider;

  if (phases.length <= 1) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2.5,
        px: 1,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {phases.map((phase, i) => {
        const isComplete = phase.completion_pct === 100;
        const isCurrent = phase.phase_number === currentPhase;
        const isFuture = !isComplete && !isCurrent;

        const dotColor = isComplete ? success : isCurrent ? primary : divider;
        const dotSize = isCurrent ? 14 : 10;
        const prefix = isSongFirst ? 'S' : 'Ph';
        const label = `${prefix}${phase.phase_number}`;

        return (
          <Box key={phase.phase_number} sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot + label */}
            <Box
              onClick={() => onDotClick(phase.phase_number)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 0.5,
                minWidth: 32,
              }}
            >
              <Box
                sx={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  bgcolor: isFuture ? 'transparent' : dotColor,
                  border: `2px solid ${dotColor}`,
                  boxShadow: isCurrent ? `0 0 0 3px ${primary}33` : 'none',
                  transition: 'all 0.2s',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.55rem',
                  color: isCurrent ? primary : 'text.disabled',
                  fontWeight: isCurrent ? 700 : 400,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {label}
              </Typography>
            </Box>

            {/* Connecting line */}
            {i < phases.length - 1 && (
              <Box
                sx={{
                  height: 2,
                  flex: 1,
                  minWidth: 24,
                  bgcolor: isComplete ? success : divider,
                  mx: 0.5,
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
