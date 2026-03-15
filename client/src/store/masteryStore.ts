import { create } from 'zustand';
import api from '../services/api';
import type { MasteryMapResponse } from '@gmh/shared/types';

interface MasteryStoreState {
  map: MasteryMapResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchMap: () => Promise<void>;
  runRustyCheck: () => Promise<void>;
  reset: () => void;
}

export const useMasteryStore = create<MasteryStoreState>((set) => ({
  map: null,
  isLoading: false,
  error: null,

  fetchMap: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<MasteryMapResponse>('/api/mastery/map');
      set({ map: data, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Could not load mastery map.' });
    }
  },

  runRustyCheck: async () => {
    try {
      await api.post('/api/mastery/rusty-check');
    } catch {
      // fire-and-forget — silently ignore failures
    }
  },

  reset: () => set({ map: null, isLoading: false, error: null }),
}));
