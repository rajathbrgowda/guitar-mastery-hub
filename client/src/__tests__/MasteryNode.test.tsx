import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MasteryNode from '../components/MasteryNode';
import type { MasteryNode as MasteryNodeType } from '@gmh/shared/types';

const theme = createTheme();

function makeNode(state: MasteryNodeType['mastery_state']): MasteryNodeType {
  return {
    skill_key: 'open_chords',
    title: 'Open Chords',
    phase_index: 0,
    skill_index: 0,
    mastery_state: state,
    last_practiced_at: null,
    confidence_history: [],
    youtube_id: null,
    practice_tip: null,
  };
}

function renderNode(node: MasteryNodeType, onSelect = vi.fn()) {
  return render(
    <ThemeProvider theme={theme}>
      <MasteryNode node={node} onSelect={onSelect} />
    </ThemeProvider>,
  );
}

describe('MasteryNode', () => {
  it('renders tooltip with skill title as aria-label', () => {
    renderNode(makeNode('not_started'));
    // MUI Tooltip renders aria-label on the child element
    expect(screen.getByLabelText('Open Chords')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    renderNode(makeNode('mastered'), onSelect);
    fireEvent.click(screen.getByLabelText('Open Chords'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ skill_key: 'open_chords' }));
  });

  it('renders without crashing for each mastery state', () => {
    const states: MasteryNodeType['mastery_state'][] = [
      'not_started',
      'learning',
      'mastered',
      'rusty',
    ];
    for (const state of states) {
      const { unmount } = renderNode(makeNode(state));
      expect(screen.getByLabelText('Open Chords')).toBeInTheDocument();
      unmount();
    }
  });
});
