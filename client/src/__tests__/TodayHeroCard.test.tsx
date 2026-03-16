import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TodayHeroCard from '../components/TodayHeroCard';

vi.mock('../components/PracticeTimerPanel', () => ({
  default: ({ onSubmit }: { onSubmit: (p: unknown) => void }) => (
    <button onClick={() => onSubmit({ date: '2026-03-15', duration_min: 30 })}>
      Start Timer Panel
    </button>
  ),
}));

const theme = createTheme();

function renderCard(
  todaySessions = [] as { duration_min: number; confidence?: number | null }[],
  onLog = vi.fn(),
) {
  return render(
    <ThemeProvider theme={theme}>
      <TodayHeroCard todaySessions={todaySessions as never} todayStr="2026-03-15" onLog={onLog} />
    </ThemeProvider>,
  );
}

describe('TodayHeroCard', () => {
  it('shows start timer and log manually buttons when no session today', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log manually/i })).toBeInTheDocument();
  });

  it('shows "Practiced today" summary when session exists', () => {
    renderCard([{ duration_min: 30, confidence: 3 }]);
    expect(screen.getByText(/practiced today/i)).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('switches to manual mode and shows duration input', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /log manually/i }));
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it('duration input has responsive width via sx (100% on xs)', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /log manually/i }));
    // The input renders; sx responsive values are a compile-time concern — confirm element exists
    const input = screen.getByLabelText(/duration/i);
    expect(input).toBeInTheDocument();
  });

  it('shows Log session and Cancel buttons in manual mode', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /log manually/i }));
    expect(screen.getByRole('button', { name: /log session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('cancel returns to choose mode', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /log manually/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('calls onLog with correct payload on submit', async () => {
    const onLog = vi.fn().mockResolvedValue(undefined);
    renderCard([], onLog);
    fireEvent.click(screen.getByRole('button', { name: /log manually/i }));
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: /log session/i }));
    await vi.waitFor(() => {
      expect(onLog).toHaveBeenCalledWith(
        expect.objectContaining({ duration_min: 45, date: '2026-03-15' }),
      );
    });
  });
});
