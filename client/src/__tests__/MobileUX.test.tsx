/**
 * CARD-383 — Mobile UX regression tests
 *
 * Covers:
 * - Bottom nav renders with 4 primary labels + More button
 * - Landing nav About/Demo buttons present in DOM (hidden on xs via MUI sx CSS)
 * - Dashboard stat tiles render all 4 labels
 * - SkillRow text truncation: noWrap + textOverflow:ellipsis
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// ── Global mocks ────────────────────────────────────────────────────────────

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('../services/api', () => ({
  default: { get: mockGet },
  api: { get: mockGet },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' }, session: null, loading: false }),
}));

vi.mock('../store/userStore', () => ({
  useUserStore: () => ({
    profile: { display_name: 'Test', daily_goal_min: 20, practice_days_target: 5 },
    loading: false,
    fetchProfile: vi.fn(),
  }),
}));

vi.mock('../store/progressStore', () => ({
  useProgressStore: () => ({
    skills: [],
    currentPhase: 1,
    fetchProgress: vi.fn(),
    loading: false,
  }),
}));

vi.mock('../store/practicePlanStore', () => ({
  usePracticePlanStore: () => ({
    todaysPlan: null,
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

vi.mock('../store/insightsStore', () => ({
  useInsightsStore: () => ({ insights: null, fetchInsights: vi.fn() }),
}));

vi.mock('../store/milestoneStore', () => ({
  useMilestoneStore: () => ({
    milestones: [],
    celebrationQueue: [],
    fetchMilestones: vi.fn(),
    dismissCelebration: vi.fn(),
  }),
}));

// Silence fetch for CloseCTA public stats
global.fetch = vi.fn().mockResolvedValue({ ok: false }) as typeof fetch;

// ── Imports (after mocks) ────────────────────────────────────────────────────

import AppLayout from '../components/AppLayout';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import { SkillRow } from '../components/SkillRow';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

const theme = createTheme();

function wrap(ui: React.ReactElement, initialPath = '/app') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>,
  );
}

// ── AppLayout bottom nav ─────────────────────────────────────────────────────

describe('AppLayout — bottom navigation', () => {
  it('renders BottomNavigationAction labels for primary routes', () => {
    wrap(<AppLayout />);
    // BottomNavigationAction renders span.MuiBottomNavigationAction-label
    // getAllByText handles the case where sidebar also has "Dashboard"
    const dashEls = screen.getAllByText('Dashboard');
    // At least one must be a BottomNavigationAction label
    const hasBottomNavLabel = dashEls.some((el) =>
      el.className.includes('BottomNavigationAction-label'),
    );
    expect(hasBottomNavLabel).toBe(true);
  });

  it('renders Practice in bottom nav', () => {
    wrap(<AppLayout />);
    const practiceEls = screen.getAllByText('Practice');
    const hasBottomNavLabel = practiceEls.some((el) =>
      el.className.includes('BottomNavigationAction-label'),
    );
    expect(hasBottomNavLabel).toBe(true);
  });

  it('renders Roadmap in bottom nav', () => {
    wrap(<AppLayout />);
    const els = screen.getAllByText('Roadmap');
    const hasBottomNavLabel = els.some((el) =>
      el.className.includes('BottomNavigationAction-label'),
    );
    expect(hasBottomNavLabel).toBe(true);
  });

  it('renders Analytics in bottom nav', () => {
    wrap(<AppLayout />);
    const els = screen.getAllByText('Analytics');
    const hasBottomNavLabel = els.some((el) =>
      el.className.includes('BottomNavigationAction-label'),
    );
    expect(hasBottomNavLabel).toBe(true);
  });

  it('renders the More button for secondary routes', () => {
    wrap(<AppLayout />);
    const moreEls = screen.getAllByText('More');
    expect(moreEls.length).toBeGreaterThan(0);
  });
});

// ── Landing nav ──────────────────────────────────────────────────────────────

describe('Landing — nav collapses on xs', () => {
  it('About button(s) present in DOM (MUI sx hides on xs via CSS)', () => {
    wrap(<Landing />, '/');
    // Two About anchors exist: one in nav, one in footer — both in DOM, CSS hides nav one on xs
    const aboutEls = screen.getAllByText(/^About$/i);
    expect(aboutEls.length).toBeGreaterThan(0);
  });

  it('Demo button present in DOM (hidden on xs via sx)', () => {
    wrap(<Landing />, '/');
    const demoEls = screen.getAllByText(/^Demo$/i);
    expect(demoEls.length).toBeGreaterThan(0);
  });

  it('Log in button always visible (no xs:none)', () => {
    wrap(<Landing />, '/');
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('Sign up button always visible (no xs:none)', () => {
    wrap(<Landing />, '/');
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});

// ── Dashboard stat tiles ─────────────────────────────────────────────────────

describe('Dashboard — stat tiles', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockGet.mockResolvedValue({
      data: { totalMins: 60, totalSessions: 4, streak: 2, currentPhase: 1, last7: [] },
    });
  });

  it('renders Streak tile label', async () => {
    wrap(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Streak')).toBeInTheDocument());
  });

  it('renders Sessions tile label', async () => {
    wrap(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Sessions')).toBeInTheDocument());
  });

  it('renders Phase tile label', async () => {
    wrap(<Dashboard />);
    await waitFor(() => expect(screen.getAllByText(/phase/i).length).toBeGreaterThan(0));
  });

  it('renders This week tile label', async () => {
    wrap(<Dashboard />);
    await waitFor(() => expect(screen.getByText('This week')).toBeInTheDocument());
  });
});

// ── SkillRow text truncation ─────────────────────────────────────────────────

describe('SkillRow — text truncation on long titles', () => {
  function makeSkill(title: string): RoadmapSkill {
    return {
      skill_id: 'skill-1',
      skill_key: 'test-skill',
      skill_title: title,
      skill_category: 'technique',
      practice_tip: null,
      video_youtube_id: null,
      completed: false,
      confidence: null,
      last_practiced_at: null,
    };
  }

  it('renders a long title without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkillRow
          skill={makeSkill('A Very Long Skill Title That Would Normally Overflow The Container')}
          onConfidenceRate={vi.fn()}
        />
      </ThemeProvider>,
    );
    expect(
      screen.getByText('A Very Long Skill Title That Would Normally Overflow The Container'),
    ).toBeInTheDocument();
  });

  it('title element has overflow:hidden (MUI noWrap)', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkillRow skill={makeSkill('Long Title')} onConfidenceRate={vi.fn()} />
      </ThemeProvider>,
    );
    const el = screen.getByText('Long Title');
    expect(el).toHaveStyle('overflow: hidden');
  });
});
