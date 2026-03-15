import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { YearHeatmap } from '../components/YearHeatmap';
import type { WeeklyHeatmapDay } from '@gmh/shared/types/analytics';

const theme = createTheme();

function makeHeatmapData(): WeeklyHeatmapDay[] {
  return Array.from({ length: 364 }, (_, i) => {
    const d = new Date(2025, 3, 1); // start date
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      duration_min: i % 5 === 0 ? 0 : 30,
      week: Math.floor(i / 7),
      day_of_week: d.getUTCDay(),
    };
  });
}

describe('YearHeatmap', () => {
  it('renders 364 cells', () => {
    render(
      <ThemeProvider theme={theme}>
        <YearHeatmap data={makeHeatmapData()} />
      </ThemeProvider>,
    );
    expect(screen.getAllByTestId('heatmap-cell')).toHaveLength(364);
  });
});
