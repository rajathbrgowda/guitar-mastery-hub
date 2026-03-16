import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RoadmapPhaseCard } from '../components/RoadmapPhaseCard';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

const theme = createTheme();

function makePhase(overrides: Partial<RoadmapPhase> = {}): RoadmapPhase {
  return {
    phase_number: 1,
    phase_title: 'Phase 1: Foundations',
    total_skills: 4,
    completed_skills: 2,
    completion_pct: 50,
    started_at: null,
    completed_at: null,
    focus_skill: null,
    skills: [
      {
        skill_id: 'skill-1',
        skill_key: 'em_chord',
        skill_title: 'Em Chord',
        skill_category: 'chord',
        practice_tip: null,
        common_mistake: null,
        practice_exercise: null,
        video_youtube_id: null,
        video_title: null,
        completed: true,
        confidence: null,
        last_practiced_at: null,
      },
    ],
    ...overrides,
  };
}

function renderCard(props: Partial<Parameters<typeof RoadmapPhaseCard>[0]> = {}) {
  const phase = makePhase();
  return render(
    <ThemeProvider theme={theme}>
      <RoadmapPhaseCard
        phase={phase}
        isCurrentPhase={false}
        defaultExpanded={true}
        onSkillClick={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('RoadmapPhaseCard', () => {
  it('renders phase number in overline', () => {
    renderCard();
    expect(screen.getAllByText(/Phase 1/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders phase_title', () => {
    renderCard();
    expect(screen.getByText('Phase 1: Foundations')).toBeInTheDocument();
  });

  it('renders completion percentage', () => {
    renderCard();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('skills list is visible when defaultExpanded=true', () => {
    renderCard({ defaultExpanded: true });
    expect(screen.getByText('Em Chord')).toBeInTheDocument();
  });

  it('shows CURRENT badge when isCurrentPhase=true', () => {
    renderCard({ isCurrentPhase: true });
    expect(screen.getByText('CURRENT')).toBeInTheDocument();
  });

  it('does not show CURRENT badge when isCurrentPhase=false', () => {
    renderCard({ isCurrentPhase: false });
    expect(screen.queryByText('CURRENT')).not.toBeInTheDocument();
  });

  it('shows empty state when phase has no skills', () => {
    renderCard({ phase: makePhase({ skills: [] }), defaultExpanded: true });
    expect(screen.getByText('No skills in this phase yet.')).toBeInTheDocument();
  });

  it('shows Set prefix for song-first curriculum', () => {
    renderCard({ isSongFirst: true });
    expect(screen.getByText(/Set 1/i)).toBeInTheDocument();
  });

  it('shows completion date for completed phase', () => {
    renderCard({
      phase: makePhase({
        completion_pct: 100,
        completed_skills: 4,
        completed_at: '2026-01-15T00:00:00Z',
        started_at: '2026-01-01T00:00:00Z',
      }),
    });
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it('shows focus chip for current phase with focus_skill', () => {
    renderCard({
      isCurrentPhase: true,
      phase: makePhase({
        focus_skill: {
          skill_id: 's2',
          skill_key: 'am_chord',
          skill_title: 'Am Chord',
          skill_category: 'chord',
          practice_tip: null,
          common_mistake: null,
          practice_exercise: null,
          video_youtube_id: null,
          video_title: null,
          completed: false,
          confidence: 1,
          last_practiced_at: null,
        },
      }),
    });
    expect(screen.getByText(/Focus on: Am Chord/)).toBeInTheDocument();
  });
});
