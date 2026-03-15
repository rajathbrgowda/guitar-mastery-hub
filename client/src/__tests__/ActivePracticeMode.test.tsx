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

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));
vi.mock('../services/api', () => ({
  default: { post: mockPost },
  api: { post: mockPost },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const PLAN_ITEM = {
  id: 'item-1',
  plan_id: 'plan-1',
  skill_id: 'skill-1',
  skill_title: 'Em Chord',
  skill_category: 'chord',
  duration_min: 5,
  sort_order: 0,
  video_youtube_id: null,
  practice_tip: 'Keep your thumb behind the neck.',
  completed: false,
  completed_at: null,
  actual_duration_min: null,
  confidence_rating: null,
};

const PLAN = {
  id: 'plan-1',
  user_id: 'u1',
  plan_date: '2026-03-15',
  curriculum_key: 'best_of_all',
  total_duration_min: 20,
  status: 'pending' as const,
  generated_at: new Date().toISOString(),
  started_at: null,
  completed_at: null,
  items: [PLAN_ITEM],
};

vi.mock('../store/practicePlanStore', () => ({
  usePracticePlanStore: () => ({
    todaysPlan: PLAN,
    isLoading: false,
    error: null,
    noplan: false,
    fetchTodaysPlan: vi.fn(),
    completeItem: vi.fn(),
    skipPlan: vi.fn(),
    reset: vi.fn(),
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </MemoryRouter>
  );
}

import ActivePracticeMode from '../pages/ActivePracticeMode';

describe('ActivePracticeMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ data: { success: true, allDone: false } });
  });

  it('renders the current plan item title and tip', () => {
    render(<ActivePracticeMode />, { wrapper: Wrapper });
    expect(screen.getByText('Em Chord')).toBeTruthy();
    expect(screen.getByText('Keep your thumb behind the neck.')).toBeTruthy();
  });

  it('renders item count indicator', () => {
    render(<ActivePracticeMode />, { wrapper: Wrapper });
    expect(screen.getByText('1 of 1')).toBeTruthy();
  });

  it('shows confidence overlay after Done is clicked', async () => {
    render(<ActivePracticeMode />, { wrapper: Wrapper });

    const doneBtn = screen.getByRole('button', { name: /done/i });
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(screen.getByText('How did that feel?')).toBeTruthy();
    });
  });

  it('calls POST with confidence_rating after Easy is tapped', async () => {
    render(<ActivePracticeMode />, { wrapper: Wrapper });

    // Click Done to show rating overlay
    fireEvent.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => screen.getByText('Easy'));
    fireEvent.click(screen.getByText('Easy'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/practice/plan/today/items/item-1/complete',
        expect.objectContaining({ confidence_rating: 3 }),
      );
    });
  });

  it('navigates back on back button click', () => {
    render(<ActivePracticeMode />, { wrapper: Wrapper });
    const backBtn = screen.getByRole('button', { name: /exit practice/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });
});
