import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MasteryNodePanel from '../components/MasteryNodePanel';
import type { MasteryNode } from '@gmh/shared/types';

const theme = createTheme();

const BASE_NODE: MasteryNode = {
  skill_key: 'open_chords',
  title: 'Open Chords',
  phase_index: 0,
  skill_index: 0,
  mastery_state: 'mastered',
  last_practiced_at: '2026-03-01T10:00:00Z',
  confidence_history: [3, 2, 1],
  youtube_id: null,
  practice_tip: 'Practice slowly with a metronome.',
};

function renderPanel(node: MasteryNode | null, onClose = vi.fn(), onMarkRevisited = vi.fn()) {
  return render(
    <ThemeProvider theme={theme}>
      <MasteryNodePanel node={node} onClose={onClose} onMarkRevisited={onMarkRevisited} />
    </ThemeProvider>,
  );
}

describe('MasteryNodePanel', () => {
  it('renders nothing when node is null', () => {
    const { container } = renderPanel(null);
    // Drawer is closed — no skill title in document
    expect(screen.queryByText('Open Chords')).not.toBeInTheDocument();
  });

  it('renders skill title and mastery state chip when node provided', () => {
    renderPanel(BASE_NODE);
    expect(screen.getByText('Open Chords')).toBeInTheDocument();
    expect(screen.getByText('Mastered')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    renderPanel(BASE_NODE, onClose);
    // The close IconButton has no text label; it's the first button in the panel header
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows "Mark as Revisited" button only for rusty state', () => {
    const rustyNode: MasteryNode = { ...BASE_NODE, mastery_state: 'rusty' };
    renderPanel(rustyNode);
    expect(screen.getByRole('button', { name: /mark as revisited/i })).toBeInTheDocument();
  });

  it('does not show "Mark as Revisited" for mastered state', () => {
    renderPanel(BASE_NODE);
    expect(screen.queryByRole('button', { name: /mark as revisited/i })).not.toBeInTheDocument();
  });

  it('calls onMarkRevisited with node when revisit button clicked', () => {
    const onMarkRevisited = vi.fn();
    const rustyNode: MasteryNode = { ...BASE_NODE, mastery_state: 'rusty' };
    renderPanel(rustyNode, vi.fn(), onMarkRevisited);
    fireEvent.click(screen.getByRole('button', { name: /mark as revisited/i }));
    expect(onMarkRevisited).toHaveBeenCalledWith(rustyNode);
  });

  it('shows practice tip when present', () => {
    renderPanel(BASE_NODE);
    expect(screen.getByText('Practice slowly with a metronome.')).toBeInTheDocument();
  });

  it('renders confidence sparkline dots', () => {
    renderPanel(BASE_NODE);
    // history has 3 entries → "last 3" label
    expect(screen.getByText('last 3')).toBeInTheDocument();
  });
});
