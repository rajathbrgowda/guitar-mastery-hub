import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('../services/api', () => ({
  default: { get: mockGet },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'raj@test.com' }, session: null, loading: false }),
}));

vi.mock('../store/userStore', () => ({
  useUserStore: () => ({
    profile: { display_name: 'Raj', daily_goal_min: 20, practice_days_target: 5 },
    loading: false,
  }),
}));

vi.mock('../store/progressStore', () => ({
  useProgressStore: () => ({ skills: [], currentPhase: 1, fetchProgress: vi.fn(), loading: false }),
}));

import Dashboard from '../pages/Dashboard';

const theme = createTheme();

function renderDashboard() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Dashboard />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

const mockSummary = {
  totalMins: 120,
  totalSessions: 8,
  streak: 3,
  currentPhase: 1,
  last7: [],
};

beforeEach(() => {
  mockGet.mockClear();
  mockGet.mockResolvedValue({ data: mockSummary });
});

describe('Dashboard', () => {
  it('calls GET /api/analytics/summary on mount', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/analytics/summary');
    });
  });

  it('renders streak value from API response', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('3d')).toBeInTheDocument();
    });
  });

  it('greets the user by display name', async () => {
    renderDashboard();
    // Greeting is "Good morning/afternoon/evening, Raj"
    await waitFor(() => {
      expect(screen.getByText(/Good .+, Raj/i)).toBeInTheDocument();
    });
  });

  it('shows streak copy text after data loads', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Building momentum')).toBeInTheDocument();
    });
  });

  it('shows navigation section items', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Practice')).toBeInTheDocument();
      expect(screen.getByText('Roadmap')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('shows current phase label', async () => {
    renderDashboard();
    await waitFor(() => {
      // storePhase = 1 → "Beginner"
      expect(screen.getAllByText('Beginner').length).toBeGreaterThan(0);
    });
  });
});
