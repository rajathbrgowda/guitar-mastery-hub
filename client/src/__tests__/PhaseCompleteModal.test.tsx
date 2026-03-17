import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PhaseCompleteModal } from '../components/PhaseCompleteModal';
import type { RoadmapPhase, RoadmapSkill } from '@gmh/shared/types/roadmap';

const theme = createTheme();

function makeSkill(overrides: Partial<RoadmapSkill> = {}): RoadmapSkill {
  return {
    skill_id: 'sk-1',
    skill_key: 'test_skill',
    skill_title: 'Test Skill',
    skill_category: 'technique',
    practice_tip: null,
    common_mistake: null,
    practice_exercise: null,
    video_youtube_id: null,
    video_title: null,
    completed: false,
    confidence: null,
    last_practiced_at: null,
    ...overrides,
  };
}

function makePhase(overrides: Partial<RoadmapPhase> = {}): RoadmapPhase {
  return {
    phase_number: 1,
    phase_title: 'Foundations',
    skills: [makeSkill({ skill_key: 'chord_em', skill_title: 'Em Chord' })],
    total_skills: 1,
    completed_skills: 1,
    completion_pct: 100,
    started_at: null,
    completed_at: null,
    focus_skill: null,
    ...overrides,
  };
}

function renderModal(props: Partial<Parameters<typeof PhaseCompleteModal>[0]> = {}) {
  const defaults = {
    open: true,
    phase: makePhase(),
    nextPhase: null,
    onClose: vi.fn(),
  };
  return render(
    <ThemeProvider theme={theme}>
      <PhaseCompleteModal {...defaults} {...props} />
    </ThemeProvider>,
  );
}

describe('PhaseCompleteModal', () => {
  it('renders phase title and skill count', () => {
    renderModal({ phase: makePhase({ phase_title: 'Foundations', completed_skills: 11 }) });
    expect(screen.getByText('Foundations Complete')).toBeInTheDocument();
    expect(screen.getByText(/11 skills mastered/i)).toBeInTheDocument();
  });

  it('shows songs when is_song skills are present', () => {
    const phase = makePhase({
      skills: [
        makeSkill({ skill_key: 'wonderwall', skill_title: 'Wonderwall', is_song: true }),
        makeSkill({ skill_key: 'em', skill_title: 'Em Chord' }),
      ],
    });
    renderModal({ phase });
    expect(screen.getByText('Wonderwall')).toBeInTheDocument();
    expect(screen.queryByText('Em Chord')).not.toBeInTheDocument(); // not a song
  });

  it('shows fallback message when no song skills', () => {
    const phase = makePhase({
      completed_skills: 5,
      skills: [makeSkill()],
    });
    renderModal({ phase });
    expect(screen.getByText(/5 techniques under your fingers/i)).toBeInTheDocument();
  });

  it('shows +N more when more than 4 songs', () => {
    const songs = Array.from({ length: 6 }, (_, i) =>
      makeSkill({ skill_key: `song_${i}`, skill_title: `Song ${i}`, is_song: true }),
    );
    renderModal({ phase: makePhase({ skills: songs }) });
    expect(screen.getByText('+ 2 more')).toBeInTheDocument();
  });

  it('shows next phase preview when nextPhase provided', () => {
    const next = makePhase({
      phase_number: 2,
      phase_title: 'Building',
      skills: [
        makeSkill({ skill_key: 'barre_f', skill_title: 'F Barre Chord' }),
        makeSkill({ skill_key: 'barre_b', skill_title: 'B Minor Chord' }),
      ],
    });
    renderModal({ nextPhase: next });
    expect(screen.getByText(/up next — building/i)).toBeInTheDocument();
    expect(screen.getByText('F Barre Chord')).toBeInTheDocument();
  });

  it('shows curriculum-complete message when last phase', () => {
    renderModal({ nextPhase: null });
    expect(screen.getByText(/completed the full curriculum/i)).toBeInTheDocument();
  });

  it('calls onClose when CTA button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose, nextPhase: null });
    fireEvent.click(screen.getByRole('button', { name: /back to roadmap/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Continue button is clicked (with next phase)', () => {
    const onClose = vi.fn();
    const next = makePhase({ phase_number: 2, phase_title: 'Building' });
    renderModal({ onClose, nextPhase: next });
    fireEvent.click(screen.getByRole('button', { name: /continue to building/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Close button is clicked (with next phase)', () => {
    const onClose = vi.fn();
    const next = makePhase({ phase_number: 2, phase_title: 'Building' });
    renderModal({ onClose, nextPhase: next });
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onSongClick and onClose when a song is tapped', () => {
    const onClose = vi.fn();
    const onSongClick = vi.fn();
    const phase = makePhase({
      skills: [
        makeSkill({ skill_key: 'hotel_cal', skill_title: 'Hotel California', is_song: true }),
      ],
    });
    renderModal({ phase, onClose, onSongClick });
    fireEvent.click(screen.getByText('Hotel California'));
    expect(onSongClick).toHaveBeenCalledWith(expect.objectContaining({ skill_key: 'hotel_cal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows completion date when completed_at is set', () => {
    const phase = makePhase({ completed_at: '2026-03-10T12:00:00Z' });
    renderModal({ phase });
    expect(screen.getByText(/finished mar 10/i)).toBeInTheDocument();
  });
});
