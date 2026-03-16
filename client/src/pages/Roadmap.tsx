import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';
import { useCurriculumStore } from '../store/curriculumStore';
import { RoadmapPhaseCard } from '../components/RoadmapPhaseCard';
import { PhasePreviewDrawer } from '../components/PhasePreviewDrawer';
import { WeeklyPaceEstimate } from '../components/WeeklyPaceEstimate';
import { PhaseProgressStrip } from '../components/PhaseProgressStrip';
import { SkillDetailDrawer } from '../components/SkillDetailDrawer';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

export default function Roadmap() {
  const { data, loading, error, fetchRoadmap } = useRoadmapStore();
  const { isSwitching } = useCurriculumStore();
  const [drawerPhase, setDrawerPhase] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<RoadmapSkill | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const currentPhase = data?.phases.find((p) => p.phase_number === data.current_phase);
  const skillsPerWeek = data?.skills_per_week ?? null;
  const isSongFirst = data?.curriculum_style === 'song-first';

  // Phase scroll refs
  const phaseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const totalSkills = data?.phases.reduce((s, p) => s + p.total_skills, 0) ?? 0;

  // Preview drawer — any future phase
  const previewPhase =
    drawerPhase != null ? (data?.phases.find((p) => p.phase_number === drawerPhase) ?? null) : null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
          >
            Roadmap
          </Typography>
          {data && (
            <Chip
              label={data.curriculum_name}
              size="small"
              variant="outlined"
              icon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => navigate('/app/settings')}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', height: 24 }}
            />
          )}
          {loading && <Skeleton width={90} height={24} sx={{ borderRadius: 1 }} />}
        </Box>
        {data && (
          <Typography variant="body2" color="text.secondary">
            {data.phases.length} phases · {totalSkills} skills · {isSongFirst ? 'Set' : 'Phase'}{' '}
            {data.current_phase} active
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading || isSwitching ? (
        [1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2 }} />)
      ) : !data || data.phases.length === 0 ? (
        <Alert severity="info">
          No curriculum data found. Check your curriculum selection in Settings.
        </Alert>
      ) : (
        <>
          {/* Sparse curriculum warning */}
          {totalSkills > 0 && totalSkills < 5 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your curriculum is still being set up. Content will appear here soon.
            </Alert>
          )}

          {/* Phase progress strip */}
          <PhaseProgressStrip
            phases={data.phases}
            currentPhase={data.current_phase}
            isSongFirst={isSongFirst}
            onDotClick={(phaseNum) => {
              phaseRefs.current[phaseNum]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />

          {/* Pace estimator */}
          {currentPhase && (
            <Box sx={{ mb: 1.5 }}>
              <WeeklyPaceEstimate phase={currentPhase} skillsPerWeek={skillsPerWeek} />
            </Box>
          )}

          {/* Phase cards */}
          {data.phases.map((phase) => (
            <div
              key={phase.phase_number}
              ref={(el) => {
                phaseRefs.current[phase.phase_number] = el;
              }}
            >
              <RoadmapPhaseCard
                phase={phase}
                isCurrentPhase={phase.phase_number === data.current_phase}
                isSongFirst={isSongFirst}
                defaultExpanded={phase.phase_number === data.current_phase}
                onSkillClick={setSelectedSkill}
                onPreviewClick={
                  phase.phase_number > data.current_phase
                    ? () => setDrawerPhase(phase.phase_number)
                    : undefined
                }
              />
            </div>
          ))}
        </>
      )}

      <PhasePreviewDrawer
        nextPhase={previewPhase}
        open={previewPhase != null}
        onClose={() => setDrawerPhase(null)}
      />

      <SkillDetailDrawer
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        curriculumKey={data?.curriculum_key ?? ''}
      />
    </Box>
  );
}
