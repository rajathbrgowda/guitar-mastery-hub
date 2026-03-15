import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MilestoneBadge } from '../components/MilestoneBadge';
import type { Milestone } from '@gmh/shared/types/milestones';

const theme = createTheme();

const EARNED: Milestone = {
  key: 'first_session',
  title: 'First Note',
  description: 'Log your very first practice session.',
  category: 'sessions',
  earned: true,
  earned_at: '2026-03-01',
};

const LOCKED: Milestone = {
  key: 'sessions_100',
  title: 'Century Mark',
  description: 'Complete 100 practice sessions.',
  category: 'sessions',
  earned: false,
  earned_at: null,
};

function wrap(milestone: Milestone) {
  return render(
    <ThemeProvider theme={theme}>
      <MilestoneBadge milestone={milestone} />
    </ThemeProvider>,
  );
}

describe('MilestoneBadge', () => {
  it('earned badge renders title and description', () => {
    wrap(EARNED);
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText(/Log your very first/i)).toBeInTheDocument();
  });

  it('earned badge shows earned_at date', () => {
    wrap(EARNED);
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();
  });

  it('locked badge renders title', () => {
    wrap(LOCKED);
    expect(screen.getByText('Century Mark')).toBeInTheDocument();
  });

  it('locked badge has reduced opacity', () => {
    const { container } = wrap(LOCKED);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ opacity: '0.35' });
  });
});
