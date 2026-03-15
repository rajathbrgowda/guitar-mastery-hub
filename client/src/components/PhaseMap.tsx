import { Box, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const PHASE_LABELS = [
  { num: 1, title: 'Foundations', subtitle: 'Open chords' },
  { num: 2, title: 'Building', subtitle: 'Fluency' },
  { num: 3, title: 'The Wall', subtitle: 'Barre chords' },
  { num: 4, title: 'Expanding', subtitle: 'CAGED + scales' },
  { num: 5, title: 'Your Voice', subtitle: 'Improvise' },
];

interface PhaseMapProps {
  currentPhase: number;
  /** 0–100 completion % for each phase (index 0 = phase 1) */
  phaseCompletion?: number[];
}

export function PhaseMap({ currentPhase, phaseCompletion = [] }: PhaseMapProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative', py: 1 }}>
      {PHASE_LABELS.map((phase, idx) => {
        const isDone = phase.num < currentPhase;
        const isCurrent = phase.num === currentPhase;
        const pct = phaseCompletion[idx] ?? 0;

        return (
          <Box
            key={phase.num}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
            }}
          >
            {/* Connector line (not on last) */}
            {idx < PHASE_LABELS.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  width: '100%',
                  height: 2,
                  bgcolor: isDone ? 'primary.main' : 'divider',
                  transition: 'background-color 0.3s',
                  zIndex: 0,
                }}
              />
            )}

            {/* Phase node */}
            <Tooltip
              title={
                <Box>
                  <Typography variant="caption" fontWeight={700}>
                    {phase.title}
                  </Typography>
                  <br />
                  <Typography variant="caption">{phase.subtitle}</Typography>
                  {isCurrent && pct > 0 && (
                    <>
                      <br />
                      <Typography variant="caption">{pct}% complete</Typography>
                    </>
                  )}
                </Box>
              }
              arrow
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  position: 'relative',
                  bgcolor: isDone
                    ? 'primary.main'
                    : isCurrent
                      ? 'primary.main'
                      : 'background.paper',
                  border: isCurrent ? '2px solid' : isDone ? 'none' : '2px solid',
                  borderColor: isCurrent ? 'primary.main' : isDone ? 'primary.main' : 'divider',
                  boxShadow: isCurrent
                    ? '0 0 0 4px rgba(var(--mui-palette-primary-mainChannel) / 0.15)'
                    : 'none',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
              >
                {isDone ? (
                  <CheckIcon sx={{ fontSize: 14, color: 'primary.contrastText' }} />
                ) : (
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      fontSize: '0.65rem',
                      color: isCurrent ? 'primary.contrastText' : 'text.disabled',
                    }}
                  >
                    {phase.num}
                  </Typography>
                )}
              </Box>
            </Tooltip>

            {/* Label below node */}
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontSize: '0.6rem',
                textAlign: 'center',
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? 'primary.main' : isDone ? 'text.primary' : 'text.disabled',
                lineHeight: 1.3,
                maxWidth: 52,
              }}
            >
              {phase.title}
            </Typography>

            {/* Progress % for current phase */}
            {isCurrent && pct > 0 && (
              <Typography
                variant="caption"
                sx={{ fontSize: '0.55rem', color: 'text.disabled', mt: 0.25 }}
              >
                {pct}%
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
