import { create } from 'zustand';
import { api } from '../services/api';
import type { ResourcesResponse } from '@gmh/shared/types/resources';

interface ResourcesState {
  data: ResourcesResponse | null;
  loading: boolean;
  error: string;
  fetchResources: () => Promise<void>;
  markComplete: (resourceId: string) => Promise<void>;
  reset: () => void;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  data: null,
  loading: false,
  error: '',

  fetchResources: async () => {
    set({ loading: true, error: '' });
    try {
      const res = await api.get<ResourcesResponse>('/api/resources');
      set({ data: res.data });
    } catch {
      set({ error: 'Failed to load resources.' });
    } finally {
      set({ loading: false });
    }
  },

  markComplete: async (resourceId: string) => {
    try {
      await api.put(`/api/resources/${resourceId}/completion`, {
        completion: 100,
        status: 'completed',
      });
      // Optimistic update
      const current = get().data;
      if (!current) return;
      const update = (list: typeof current.all) =>
        list.map((r) =>
          r.id === resourceId ? { ...r, completion: 100, status: 'completed' as const } : r,
        );
      set({ data: { recommended: update(current.recommended), all: update(current.all) } });
    } catch {
      set({ error: 'Failed to update resource.' });
    }
  },

  reset: () => set({ data: null, loading: false, error: '' }),
}));
