import { create } from 'zustand';
import { api } from '../services/api';
import type { CurriculumSource, CurriculumDetail } from '@gmh/shared/types/curriculum';
import { useProgressStore } from './progressStore';
import { usePracticePlanStore } from './practicePlanStore';
import { useInsightsStore } from './insightsStore';
import { useAnalyticsStore } from './analyticsStore';
import { useRoadmapStore } from './roadmapStore';
import { useUserStore } from './userStore';

interface CurriculumState {
  curricula: CurriculumSource[];
  activeCurriculum: CurriculumDetail | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isSwitching: boolean;
  listError: string | null;
  detailError: string | null;

  fetchCurricula: () => Promise<void>;
  fetchCurriculumDetail: (key: string) => Promise<void>;
  switchCurriculum: (key: string) => Promise<void>;
  reset: () => void;
}

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  curricula: [],
  activeCurriculum: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isSwitching: false,
  listError: null,
  detailError: null,

  fetchCurricula: async () => {
    set({ isLoadingList: true, listError: null });
    try {
      const { data } = await api.get<CurriculumSource[]>('/api/curriculum');
      set({ curricula: data, isLoadingList: false });
    } catch {
      set({ listError: 'Failed to load curricula', isLoadingList: false });
    }
  },

  fetchCurriculumDetail: async (key: string) => {
    // Return cached if already loaded
    if (get().activeCurriculum?.key === key) return;

    set({ isLoadingDetail: true, detailError: null });
    try {
      const { data } = await api.get<CurriculumDetail>(`/api/curriculum/${key}`);
      set({ activeCurriculum: data, isLoadingDetail: false });
    } catch {
      set({ detailError: 'Failed to load curriculum detail', isLoadingDetail: false });
    }
  },

  switchCurriculum: async (key: string) => {
    if (get().isSwitching) return;
    set({ isSwitching: true });
    try {
      await api.put('/api/users/me/curriculum', { curriculum_key: key });
      // Clear cached detail so next fetch loads the new curriculum
      set({ activeCurriculum: null });

      // Reset all curriculum-scoped stores so stale data from the old curriculum
      // is never shown after the switch.
      useProgressStore.getState().reset();
      usePracticePlanStore.getState().reset();
      useInsightsStore.getState().reset();
      useAnalyticsStore.getState().reset();
      useRoadmapStore.getState().reset();

      // Fire re-fetches in the background — caller resolves immediately after the
      // API PUT so the confirmation dialog can close without waiting for all fetches.
      // isSwitching stays true until re-fetches finish so pages can show skeletons.
      void Promise.all([
        get().fetchCurriculumDetail(key),
        usePracticePlanStore.getState().fetchTodaysPlan(),
        useProgressStore.getState().fetchProgress(),
        useRoadmapStore.getState().fetchRoadmap(),
        useUserStore.getState().fetchProfile(true),
      ]).finally(() => set({ isSwitching: false }));
    } catch {
      set({ isSwitching: false });
      throw new Error('Failed to switch curriculum');
    }
  },

  reset: () =>
    set({
      curricula: [],
      activeCurriculum: null,
      isLoadingList: false,
      isLoadingDetail: false,
      isSwitching: false,
      listError: null,
      detailError: null,
    }),
}));
