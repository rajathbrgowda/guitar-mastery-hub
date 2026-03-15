import { create } from 'zustand';
import { api } from '../services/api';
import type {
  AnalyticsSkillsResponse,
  AnalyticsHistoryEntry,
  WeeklyHeatmapDay,
  StreakData,
  InsightCard,
} from '@gmh/shared/types/analytics';

interface AnalyticsState {
  skillsData: AnalyticsSkillsResponse | null;
  activityHistory: AnalyticsHistoryEntry[];
  heatmapData: WeeklyHeatmapDay[];
  streakData: StreakData | null;
  insightCards: InsightCard[];
  loading: boolean;
  error: string;
  fetchSkillsAnalytics: () => Promise<void>;
  fetchActivityHistory: (days?: number) => Promise<void>;
  fetchHeatmap: () => Promise<void>;
  fetchStreakDetail: () => Promise<void>;
  fetchInsightCards: () => Promise<void>;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  skillsData: null,
  activityHistory: [],
  heatmapData: [],
  streakData: null,
  insightCards: [],
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

  fetchHeatmap: async () => {
    try {
      const res = await api.get<WeeklyHeatmapDay[]>('/api/analytics/heatmap');
      set({ heatmapData: res.data });
    } catch {
      set({ error: 'Failed to load heatmap.' });
    }
  },

  fetchStreakDetail: async () => {
    try {
      const res = await api.get<StreakData>('/api/analytics/streak/detail');
      set({ streakData: res.data });
    } catch {
      /* non-critical */
    }
  },

  fetchInsightCards: async () => {
    try {
      const res = await api.get<{ cards: InsightCard[] }>('/api/analytics/insights/cards');
      set({ insightCards: res.data.cards });
    } catch {
      /* non-critical */
    }
  },

  reset: () =>
    set({
      skillsData: null,
      activityHistory: [],
      heatmapData: [],
      streakData: null,
      insightCards: [],
      error: '',
    }),
}));
