import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from '../components/StreakDisplay';

describe('StreakDisplay', () => {
  it('renders current streak number', () => {
    render(
      <StreakDisplay
        streakData={{
          current_streak: 7,
          longest_streak: 14,
          last_practiced: '2026-03-14',
          at_risk: false,
        }}
      />,
    );
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('shows at-risk warning when at_risk=true', () => {
    render(
      <StreakDisplay
        streakData={{
          current_streak: 5,
          longest_streak: 10,
          last_practiced: '2026-03-14',
          at_risk: true,
        }}
      />,
    );
    expect(screen.getByText(/keep your 5-day streak alive/i)).toBeTruthy();
  });
});
