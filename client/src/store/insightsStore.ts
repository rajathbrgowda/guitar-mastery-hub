import { create } from 'zustand';
import { api } from '../services/api';
import type { InsightsSummary } from '@gmh/shared/types/analytics';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface InsightsState {
  data: InsightsSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchedAt: number | null;

  fetchInsights: () => Promise<void>;
  reset: () => void;
}

export const useInsightsStore = create<InsightsState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchedAt: null,

  fetchInsights: async () => {
    const { fetchedAt, isLoading } = get();
    // Skip if already loading or cache is still fresh
    if (isLoading) return;
    if (fetchedAt && Date.now() - fetchedAt < CACHE_TTL_MS) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<InsightsSummary>('/api/analytics/insights');
      set({ data, isLoading: false, fetchedAt: Date.now() });
    } catch {
      set({ error: 'Failed to load insights', isLoading: false });
    }
  },

  reset: () => set({ data: null, isLoading: false, error: null, fetchedAt: null }),
}));
