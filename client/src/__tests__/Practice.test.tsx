import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

const mockLogSession = vi.fn();
const mockFetchSessions = vi.fn();
const mockFetchWeek = vi.fn();

vi.mock('../store/practiceStore', () => ({
  usePracticeStore: () => ({
    sessions: [],
    weekDays: [],
    loading: false,
    weekLoading: false,
    error: null,
    fetchSessions: mockFetchSessions,
    fetchWeek: mockFetchWeek,
    logSession: mockLogSession,
    reset: vi.fn(),
  }),
}));

vi.mock('../store/userStore', () => ({
  useUserStore: () => ({ profile: { daily_goal_min: 20 }, loading: false }),
}));

import Practice from '../pages/Practice';

const theme = createTheme();

function renderPractice() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Practice />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockLogSession.mockReset();
  mockFetchSessions.mockReset();
  mockFetchWeek.mockReset();
  mockLogSession.mockResolvedValue({
    id: 'sess-1',
    date: '2026-03-15',
    duration_min: 30,
    sections: null,
    notes: null,
    confidence: null,
    created_at: '2026-03-15T10:00:00Z',
  });
});

describe('Practice', () => {
  it('fetches sessions and week on mount', async () => {
    renderPractice();
    await waitFor(() => {
      expect(mockFetchSessions).toHaveBeenCalledOnce();
      expect(mockFetchWeek).toHaveBeenCalledOnce();
    });
  });

  it('shows Start Timer and Log Manually buttons', () => {
    renderPractice();
    expect(screen.getByRole('button', { name: /Start Timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Manually/i })).toBeInTheDocument();
  });

  it('shows manual log form when Log Manually is clicked', async () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /Log Manually/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log session/i })).toBeInTheDocument();
    });
  });

  it('calls logSession with correct duration when quick-log form submitted', async () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /Log Manually/i }));
    await waitFor(() => screen.getByText('30 min'));

    fireEvent.click(screen.getByText('30 min'));
    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));

    await waitFor(() => {
      expect(mockLogSession).toHaveBeenCalledOnce();
      const call = mockLogSession.mock.calls[0][0];
      expect(call.duration_min).toBe(30);
      expect(call.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('shows validation error when Log session clicked with no duration', async () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /Log Manually/i }));
    await waitFor(() => screen.getByRole('button', { name: /Log session/i }));

    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid duration/i)).toBeInTheDocument();
    });
    expect(mockLogSession).not.toHaveBeenCalled();
  });

  it('shows empty state when no sessions', () => {
    renderPractice();
    expect(screen.getByText(/No sessions yet/i)).toBeInTheDocument();
  });
});
