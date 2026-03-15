import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RoadmapPhaseCard } from '../components/RoadmapPhaseCard';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

const theme = createTheme();

function makePhase(overrides: Partial<RoadmapPhase> = {}): RoadmapPhase {
  return {
    phase_number: 1,
    total_skills: 4,
    completed_skills: 2,
    completion_pct: 50,
    skills: [
      {
        skill_id: 'skill-1',
        skill_key: 'em-chord',
        skill_title: 'Em Chord',
        skill_category: 'chord',
        practice_tip: null,
        video_youtube_id: null,
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
        onConfidenceRate={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('RoadmapPhaseCard', () => {
  it('renders phase number', () => {
    renderCard();
    expect(screen.getByText(/Phase 1/i)).toBeInTheDocument();
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
});
