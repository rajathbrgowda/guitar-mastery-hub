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
  api: { get: mockGet },
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

vi.mock('../store/practicePlanStore', () => ({
  usePracticePlanStore: () => ({
    todaysPlan: {
      id: 'plan-1',
      user_id: 'u1',
      plan_date: '2026-03-15',
      curriculum_key: 'best_of_all',
      total_duration_min: 20,
      status: 'pending',
      generated_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      items: [],
    },
    noplan: false,
    isLoading: false,
    error: null,
    fetchTodaysPlan: vi.fn(),
    completeItem: vi.fn(),
    skipPlan: vi.fn(),
  }),
}));

vi.mock('../store/curriculumStore', () => ({
  useCurriculumStore: () => ({
    curricula: [],
    detail: null,
    isLoadingList: false,
    isLoadingDetail: false,
    fetchCurricula: vi.fn(),
    fetchCurriculumDetail: vi.fn(),
    switchCurriculum: vi.fn(),
  }),
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

  it('renders streak chip after data loads', async () => {
    renderDashboard();
    // streak=3 renders a Chip with label "3 day streak"
    await waitFor(() => {
      expect(screen.getByText('3 day streak')).toBeInTheDocument();
    });
  });

  it('greets the user by display name', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Good .+, Raj/i)).toBeInTheDocument();
    });
  });

  it('shows streak copy text after data loads', async () => {
    renderDashboard();
    // streak=3 → "3 days in a row. Keep the momentum."
    await waitFor(() => {
      expect(screen.getByText(/days in a row/i)).toBeInTheDocument();
    });
  });

  it("shows today's practice section", async () => {
    renderDashboard();
    await waitFor(() => {
      // TodaysPractice component renders "Today's Practice" heading
      expect(screen.getByText(/today.s practice/i)).toBeInTheDocument();
    });
  });

  it('shows phase progress section', async () => {
    renderDashboard();
    await waitFor(() => {
      // PhaseMap or progress section is rendered
      expect(screen.getByText(/phase/i)).toBeInTheDocument();
    });
  });
});
