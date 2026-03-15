import { create } from 'zustand';
import { api } from '../services/api';
import type { RoadmapResponse } from '@gmh/shared/types/roadmap';

interface RoadmapState {
  data: RoadmapResponse | null;
  loading: boolean;
  error: string;
  fetchRoadmap: () => Promise<void>;
  reset: () => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  data: null,
  loading: false,
  error: '',
  fetchRoadmap: async () => {
    set({ loading: true, error: '' });
    try {
      const res = await api.get<RoadmapResponse>('/api/roadmap');
      set({ data: res.data });
    } catch {
      set({ error: 'Failed to load roadmap.' });
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ data: null, loading: false, error: '' }),
}));
