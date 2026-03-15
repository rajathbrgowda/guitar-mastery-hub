import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import type { AnalyticsHistoryEntry } from '@gmh/shared/types/analytics';

const theme = createTheme();

function makeData(n: number): AnalyticsHistoryEntry[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 1, i + 1);
    return {
      date: d.toISOString().split('T')[0],
      duration_min: i % 3 === 0 ? 0 : 30,
    };
  });
}

describe('ActivityHeatmap', () => {
  it('renders exactly 30 squares', () => {
    render(
      <ThemeProvider theme={theme}>
        <ActivityHeatmap data={makeData(30)} />
      </ThemeProvider>,
    );
    expect(screen.getAllByTestId('heatmap-square')).toHaveLength(30);
  });

  it('square with 0 mins has low opacity (data-mins=0)', () => {
    render(
      <ThemeProvider theme={theme}>
        <ActivityHeatmap data={makeData(30)} />
      </ThemeProvider>,
    );
    const zeroSquares = screen
      .getAllByTestId('heatmap-square')
      .filter((el) => el.getAttribute('data-mins') === '0');
    expect(zeroSquares.length).toBeGreaterThan(0);
  });
});
