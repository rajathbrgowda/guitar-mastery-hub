import { create } from 'zustand';
import { api } from '../services/api';
import { useUserStore } from './userStore';
import type { ExperienceLevel, UserProfile } from '@gmh/shared/types/user';

interface OnboardingState {
  step: 1 | 2 | 3;
  experienceLevel: ExperienceLevel | null;
  curriculumKey: string | null;
  dailyGoalMin: number;
  practiceDaysTarget: number;
  submitting: boolean;
  submitError: string | null;

  setStep: (step: 1 | 2 | 3) => void;
  setExperience: (level: ExperienceLevel) => void;
  setCurriculum: (key: string) => void;
  setGoal: (dailyGoalMin: number, practiceDaysTarget: number) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  experienceLevel: null,
  curriculumKey: null,
  dailyGoalMin: 20,
  practiceDaysTarget: 5,
  submitting: false,
  submitError: null,

  setStep: (step) => set({ step }),
  setExperience: (experienceLevel) => set({ experienceLevel }),
  setCurriculum: (curriculumKey) => set({ curriculumKey }),
  setGoal: (dailyGoalMin, practiceDaysTarget) => set({ dailyGoalMin, practiceDaysTarget }),

  submit: async () => {
    const { experienceLevel, curriculumKey, dailyGoalMin, practiceDaysTarget } = get();
    if (!experienceLevel || !curriculumKey) return;

    set({ submitting: true, submitError: null });
    try {
      const { data } = await api.post<UserProfile>('/api/users/me/onboard', {
        experience_level: experienceLevel,
        curriculum_key: curriculumKey,
        daily_goal_min: dailyGoalMin,
        practice_days_target: practiceDaysTarget,
      });
      // Update userStore so ProtectedRoute sees onboarding_completed=true immediately
      useUserStore.setState({ profile: data });
    } catch {
      set({ submitError: 'Something went wrong. Please try again.' });
      throw new Error('onboard_failed');
    } finally {
      set({ submitting: false });
    }
  },

  reset: () =>
    set({
      step: 1,
      experienceLevel: null,
      curriculumKey: null,
      dailyGoalMin: 20,
      practiceDaysTarget: 5,
      submitting: false,
      submitError: null,
    }),
}));
