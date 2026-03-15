import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { WeeklyDigestCard } from '../components/WeeklyDigestCard';
import type { WeeklyDigest } from '@gmh/shared/types/analytics';

const theme = createTheme();

const DIGEST: WeeklyDigest = {
  week_start: '2026-03-08',
  sessions_count: 4,
  total_mins: 80,
  days_practiced: 3,
  top_skill_title: 'Em Chord',
};

function renderCard(digest = DIGEST, daysTarget = 5) {
  return render(
    <ThemeProvider theme={theme}>
      <WeeklyDigestCard digest={digest} daysTarget={daysTarget} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  // Force Monday for deterministic show-logic (or just ensure behindTarget)
});

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('WeeklyDigestCard', () => {
  it('renders when days_practiced is behind target by 2+', () => {
    // days_practiced=3, daysTarget=5 → 3 < 5-1=4 → should show
    renderCard({ ...DIGEST, days_practiced: 3 }, 5);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText(/total practice/i)).toBeInTheDocument();
  });

  it('shows top skill when provided', () => {
    renderCard({ ...DIGEST, days_practiced: 3 }, 5);
    expect(screen.getByText('Em Chord')).toBeInTheDocument();
  });

  it('hides when dismissed via close button', () => {
    renderCard({ ...DIGEST, days_practiced: 3 }, 5);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('80')).not.toBeInTheDocument();
  });

  it('hides when sessionStorage dismiss key is set', () => {
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem(`weekly_digest_dismissed_${today}`, '1');
    renderCard({ ...DIGEST, days_practiced: 3 }, 5);
    expect(screen.queryByText('80')).not.toBeInTheDocument();
  });

  it('hides when days_practiced meets target - 1 and not Monday', () => {
    // days_practiced = daysTarget - 1 → NOT behind → only shows on Monday
    // Mock getDay() to return non-Monday (e.g. Wednesday = 3)
    const spy = vi.spyOn(Date.prototype, 'getDay').mockReturnValue(3);
    renderCard({ ...DIGEST, days_practiced: 4 }, 5); // 4 >= 5-1 → not behind
    expect(screen.queryByText('80')).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
