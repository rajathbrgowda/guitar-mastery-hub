import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SkillRow } from '../components/SkillRow';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

const theme = createTheme();

function makeSkill(overrides: Partial<RoadmapSkill> = {}): RoadmapSkill {
  return {
    skill_id: 'skill-1',
    skill_key: 'em-chord',
    skill_title: 'Em Chord',
    skill_category: 'chord',
    practice_tip: null,
    video_youtube_id: null,
    completed: false,
    confidence: null,
    last_practiced_at: null,
    ...overrides,
  };
}

function renderRow(skill: RoadmapSkill) {
  return render(
    <ThemeProvider theme={theme}>
      <SkillRow skill={skill} onConfidenceRate={vi.fn()} />
    </ThemeProvider>,
  );
}

describe('SkillRow', () => {
  it('renders skill title', () => {
    renderRow(makeSkill());
    expect(screen.getByText('Em Chord')).toBeInTheDocument();
  });

  it('renders category chip', () => {
    renderRow(makeSkill());
    expect(screen.getByText('chord')).toBeInTheDocument();
  });

  it('shows CheckCircleIcon (SVG) when skill is completed', () => {
    const { container } = renderRow(makeSkill({ completed: true }));
    // MUI CheckCircleIcon renders as an svg element
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies line-through text decoration when completed', () => {
    renderRow(makeSkill({ completed: true }));
    const titleEl = screen.getByText('Em Chord');
    // MUI sx line-through is applied via inline style or class
    expect(titleEl).toHaveStyle('text-decoration: line-through');
  });

  it('shows confidence chip "Easy" when confidence=3', () => {
    renderRow(makeSkill({ confidence: 3 }));
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('shows confidence chip "Okay" when confidence=2', () => {
    renderRow(makeSkill({ confidence: 2 }));
    expect(screen.getByText('Okay')).toBeInTheDocument();
  });

  it('shows confidence chip "Hard" when confidence=1', () => {
    renderRow(makeSkill({ confidence: 1 }));
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('shows no confidence chip when confidence is null', () => {
    renderRow(makeSkill({ confidence: null }));
    expect(screen.queryByText('Easy')).not.toBeInTheDocument();
    expect(screen.queryByText('Okay')).not.toBeInTheDocument();
    expect(screen.queryByText('Hard')).not.toBeInTheDocument();
  });
});
