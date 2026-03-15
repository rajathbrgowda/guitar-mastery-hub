import { create } from 'zustand';
import { api } from '../services/api';
import type { AnalyticsSkillsResponse, AnalyticsHistoryEntry } from '@gmh/shared/types/analytics';

interface AnalyticsState {
  skillsData: AnalyticsSkillsResponse | null;
  activityHistory: AnalyticsHistoryEntry[];
  loading: boolean;
  error: string;
  fetchSkillsAnalytics: () => Promise<void>;
  fetchActivityHistory: (days?: number) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  skillsData: null,
  activityHistory: [],
  loading: false,
  error: '',

  fetchSkillsAnalytics: async () => {
    set({ loading: true, error: '' });
    try {
      const res = await api.get<AnalyticsSkillsResponse>('/api/analytics/skills');
      set({ skillsData: res.data });
    } catch {
      set({ error: 'Failed to load skill analytics.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchActivityHistory: async (days = 30) => {
    try {
      const res = await api.get<AnalyticsHistoryEntry[]>(`/api/analytics/history?days=${days}`);
      set({ activityHistory: res.data });
    } catch {
      set({ error: 'Failed to load activity history.' });
    }
  },
}));
