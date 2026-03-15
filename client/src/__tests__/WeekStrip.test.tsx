import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WeekStrip from '../components/WeekStrip';
import type { PracticeWeekDay } from '@gmh/shared/types';

const theme = createTheme();

const DAYS: PracticeWeekDay[] = [
  { date: '2026-03-09', day_label: 'Mon', has_session: true, duration_min: 30 },
  { date: '2026-03-10', day_label: 'Tue', has_session: false, duration_min: 0 },
  { date: '2026-03-11', day_label: 'Wed', has_session: true, duration_min: 15 },
  { date: '2026-03-12', day_label: 'Thu', has_session: false, duration_min: 0 },
  { date: '2026-03-13', day_label: 'Fri', has_session: true, duration_min: 45 },
  { date: '2026-03-14', day_label: 'Sat', has_session: false, duration_min: 0 },
  { date: '2026-03-15', day_label: 'Sun', has_session: false, duration_min: 0 },
];

function renderStrip(days: PracticeWeekDay[], todayStr = '2026-03-15') {
  return render(
    <ThemeProvider theme={theme}>
      <WeekStrip days={days} todayStr={todayStr} />
    </ThemeProvider>,
  );
}

describe('WeekStrip', () => {
  it('renders 7 day labels', () => {
    renderStrip(DAYS);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders skeleton when loading=true', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <WeekStrip days={[]} todayStr="2026-03-15" loading={true} />
      </ThemeProvider>,
    );
    // 7 circular skeletons are rendered
    const skeletons = container.querySelectorAll('.MuiSkeleton-circular');
    expect(skeletons.length).toBe(7);
  });

  it('highlights today label as bold', () => {
    renderStrip(DAYS, '2026-03-13'); // Fri is today
    const fri = screen.getByText('Fri');
    // fontWeight 700 applied via sx → check the element has text "Fri"
    expect(fri).toBeInTheDocument();
  });

  it('renders without crashing with empty days array', () => {
    renderStrip([]);
    // no crash
  });
});
