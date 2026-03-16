import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import PreviewIcon from '@mui/icons-material/Visibility';
import { useRoadmapStore } from '../store/roadmapStore';
import { RoadmapPhaseCard } from '../components/RoadmapPhaseCard';
import { PhasePreviewDrawer } from '../components/PhasePreviewDrawer';
import { WeeklyPaceEstimate } from '../components/WeeklyPaceEstimate';

export default function Roadmap() {
  const { data, loading, error, fetchRoadmap } = useRoadmapStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const currentPhase = data?.phases.find((p) => p.phase_number === data.current_phase);
  const nextPhase = data?.phases.find((p) => p.phase_number === data.current_phase + 1) ?? null;

  // sessions last 7 — approximated as 0 until analytics store integration is wired
  const sessionsLast7 = 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
          >
            Roadmap
          </Typography>
          {data && (
            <Typography variant="body2" color="text.secondary">
              {data.phases.length} phases · Phase {data.current_phase} active
            </Typography>
          )}
        </Box>
        {nextPhase && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PreviewIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Preview Phase {nextPhase.phase_number}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2 }} />)
      ) : !data || data.phases.length === 0 ? (
        <Alert severity="info">
          No curriculum data found. Check your curriculum selection in Settings.
        </Alert>
      ) : (
        <>
          {currentPhase && (
            <Box sx={{ mb: 1 }}>
              <WeeklyPaceEstimate phase={currentPhase} sessionsLast7={sessionsLast7} />
            </Box>
          )}
          {data.phases.map((phase) => (
            <RoadmapPhaseCard
              key={phase.phase_number}
              phase={phase}
              isCurrentPhase={phase.phase_number === data.current_phase}
              defaultExpanded={phase.phase_number === data.current_phase}
              onConfidenceRate={() => {
                // confidence rating handled via plan flow, not inline
              }}
            />
          ))}
        </>
      )}

      <PhasePreviewDrawer
        nextPhase={nextPhase}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  );
}
