import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useMasteryStore } from '../store/masteryStore';
import { useProgressStore } from '../store/progressStore';
import type { MasteryNode as MasteryNodeType } from '@gmh/shared/types';
import MasteryNode from '../components/MasteryNode';
import MasteryNodePanel from '../components/MasteryNodePanel';

function PhaseSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Skeleton width={160} height={24} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={4} sx={{ mb: 2, borderRadius: 1 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="circular" width={44} height={44} />
        ))}
      </Box>
    </Box>
  );
}

export default function SkillTree() {
  const { map, isLoading, error, fetchMap, runRustyCheck } = useMasteryStore();
  const { toggleSkill } = useProgressStore();
  const [selectedNode, setSelectedNode] = useState<MasteryNodeType | null>(null);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  useEffect(() => {
    // Fire rusty-check first (fire-and-forget), then fetch the map
    runRustyCheck().then(() => fetchMap());
  }, [fetchMap, runRustyCheck]);

  async function handleMarkRevisited(node: MasteryNodeType) {
    // Re-marking as mastered resets last_practiced_at to now
    await toggleSkill(node.phase_index, node.skill_index, true);
    setSelectedNode(null);
    fetchMap();
  }

  const phases = map?.phases ?? [];
  const rustyCount = map?.rusty_count ?? 0;

  if (isLoading && !map) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Skeleton width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton width={300} height={20} sx={{ mb: 4 }} />
        {[1, 2, 3].map((i) => (
          <PhaseSkeleton key={i} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
        >
          Mastery Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your skill mastery. Click any node to see details, tips, and history.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Rusty banner */}
      {rustyCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={false}>
          <strong>
            {rustyCount} skill{rustyCount !== 1 ? 's' : ''} need revisiting
          </strong>{' '}
          — you haven't practiced {rustyCount !== 1 ? 'them' : 'it'} in 21+ days. Click the node to
          review.
        </Alert>
      )}

      {phases.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Start practicing to build your mastery map.
        </Alert>
      )}

      {phases.map((phase) => {
        const total = phase.nodes.length;
        const mastered = phase.nodes.filter((n) => n.mastery_state === 'mastered').length;
        const learning = phase.nodes.filter((n) => n.mastery_state === 'learning').length;
        const rusty = phase.nodes.filter((n) => n.mastery_state === 'rusty').length;
        const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

        return (
          <Box key={phase.phase_index} sx={{ mb: 4 }}>
            {/* Phase header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: pct > 0 ? primary : theme.palette.action.disabled,
                }}
              />
              <Typography variant="overline" color="text.secondary">
                Phase {phase.phase_index + 1}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {phase.phase_title}
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {mastered > 0 && (
                  <Chip
                    label={`${mastered} mastered`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
                {rusty > 0 && (
                  <Chip
                    label={`${rusty} rusty`}
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
                {learning > 0 && (
                  <Chip
                    label={`${learning} learning`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </Box>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                mb: 2,
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(primary, 0.08),
                '& .MuiLinearProgress-bar': { bgcolor: primary },
              }}
            />

            {/* Node grid */}
            <Box sx={{ overflowX: { xs: 'auto', sm: 'visible' }, pb: { xs: 0.5, sm: 0 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: { xs: 'nowrap', sm: 'wrap' },
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {phase.nodes.map((node) => (
                  <MasteryNode key={node.skill_key} node={node} onSelect={setSelectedNode} />
                ))}
              </Box>
            </Box>

            {/* Connector */}
            {phase.phase_index < phases.length - 1 && (
              <Box sx={{ ml: 2.75, mt: 1.5, width: 2, height: 24, bgcolor: 'divider' }} />
            )}
          </Box>
        );
      })}

      {/* Legend */}
      {phases.length > 0 && (
        <Box
          sx={{
            mt: 2,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {[
            {
              label: 'Not started',
              color: theme.palette.action.disabledBackground,
              border: theme.palette.divider,
            },
            { label: 'Learning', color: alpha(primary, 0.12), border: primary },
            {
              label: 'Mastered',
              color: theme.palette.success.main,
              border: theme.palette.success.main,
            },
            {
              label: 'Rusty',
              color: alpha(theme.palette.warning.main, 0.15),
              border: theme.palette.warning.main,
            },
          ].map((leg) => (
            <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: leg.color,
                  border: `2px solid ${leg.border}`,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {leg.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Side panel */}
      <MasteryNodePanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onMarkRevisited={handleMarkRevisited}
      />
    </Box>
  );
}
