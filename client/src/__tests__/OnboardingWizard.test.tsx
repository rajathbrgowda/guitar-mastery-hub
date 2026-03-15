import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

vi.mock('../store/onboardingStore', () => ({
  useOnboardingStore: () => ({
    step: 1,
    experienceLevel: null,
    curriculumKey: null,
    dailyGoalMin: 20,
    practiceDaysTarget: 5,
    submitting: false,
    submitError: null,
    setStep: vi.fn(),
    setExperience: vi.fn(),
    setCurriculum: vi.fn(),
    setGoal: vi.fn(),
    submit: vi.fn(),
  }),
}));

vi.mock('../store/curriculumStore', () => ({
  useCurriculumStore: () => ({
    curricula: [],
    isLoadingList: false,
    listError: null,
    fetchCurricula: vi.fn(),
    switchCurriculum: vi.fn(),
  }),
}));

import OnboardingWizard from '../pages/OnboardingWizard';

const theme = createTheme();

function renderWizard() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <OnboardingWizard />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('OnboardingWizard', () => {
  it('renders step 1 with 3 experience options', () => {
    renderWizard();
    expect(screen.getByText(/experience level/i)).toBeInTheDocument();
    expect(screen.getByText(/complete beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/some experience/i)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it('shows Step 1 of 3 label', () => {
    renderWizard();
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it('Next button is disabled when no experience selected', () => {
    renderWizard();
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Back button is disabled on step 1', () => {
    renderWizard();
    const backBtn = screen.getByRole('button', { name: /back/i });
    expect(backBtn).toBeDisabled();
  });

  it('renders clickable experience cards (CardActionArea buttons)', () => {
    renderWizard();
    // 3 experience cards + Back + Next = 5 buttons minimum
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });
});
