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

vi.mock('../store/practiceStore', () => ({
  usePracticeStore: () => ({
    sessions: [],
    loading: false,
    error: null,
    fetchSessions: mockFetchSessions,
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
  mockLogSession.mockResolvedValue({
    id: 'sess-1',
    date: '2026-03-15',
    duration_min: 30,
    sections: null,
    notes: null,
    created_at: '2026-03-15T10:00:00Z',
  });
});

describe('Practice', () => {
  it('fetches sessions on mount', async () => {
    renderPractice();
    await waitFor(() => {
      expect(mockFetchSessions).toHaveBeenCalledOnce();
    });
  });

  it('calls logSession with correct date and duration when Log session is clicked', async () => {
    renderPractice();

    // Set duration via the 30-min quick chip
    fireEvent.click(screen.getByText('30 min'));

    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));

    await waitFor(() => {
      expect(mockLogSession).toHaveBeenCalledOnce();
      const call = mockLogSession.mock.calls[0][0];
      expect(call.duration_min).toBe(30);
      expect(typeof call.date).toBe('string');
      expect(call.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('shows success alert after logging a session', async () => {
    renderPractice();
    fireEvent.click(screen.getByText('30 min'));
    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));

    await waitFor(() => {
      expect(screen.getByText(/Session logged!/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when Log session clicked with no duration', async () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));

    await waitFor(() => {
      expect(screen.getByText(/Date and duration are required/i)).toBeInTheDocument();
    });
    expect(mockLogSession).not.toHaveBeenCalled();
  });

  it('does not call logSession when duration is missing', async () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /Log session/i }));
    await waitFor(() => expect(screen.getByText(/required/i)).toBeInTheDocument());
    expect(mockLogSession).not.toHaveBeenCalled();
  });
});
