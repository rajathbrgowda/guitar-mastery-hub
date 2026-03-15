import { create } from 'zustand';
import { api } from '../services/api';
import type { CurriculumSource, CurriculumDetail } from '@gmh/shared/types/curriculum';

interface CurriculumState {
  curricula: CurriculumSource[];
  activeCurriculum: CurriculumDetail | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  listError: string | null;
  detailError: string | null;

  fetchCurricula: () => Promise<void>;
  fetchCurriculumDetail: (key: string) => Promise<void>;
  switchCurriculum: (key: string) => Promise<void>;
}

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  curricula: [],
  activeCurriculum: null,
  isLoadingList: false,
  isLoadingDetail: false,
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
    try {
      await api.put('/api/users/me/curriculum', { curriculum_key: key });
      // Clear cached detail so next fetch loads the new curriculum
      set({ activeCurriculum: null });
      // Fetch new curriculum detail
      await get().fetchCurriculumDetail(key);
    } catch {
      throw new Error('Failed to switch curriculum');
    }
  },
}));
