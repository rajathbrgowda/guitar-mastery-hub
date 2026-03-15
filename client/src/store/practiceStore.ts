import { create } from 'zustand';
import api from '../services/api';
import type { PracticeSession, NewSession } from '../types/practice';
import type { PracticeWeekDay } from '@gmh/shared/types';

interface PracticeState {
  sessions: PracticeSession[];
  weekDays: PracticeWeekDay[];
  loading: boolean;
  weekLoading: boolean;
  error: string | null;
  fetchSessions: (params?: { from?: string; to?: string }) => Promise<void>;
  fetchWeek: () => Promise<void>;
  logSession: (session: NewSession) => Promise<PracticeSession>;
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  sessions: [],
  weekDays: [],
  loading: false,
  weekLoading: false,
  error: null,

  fetchWeek: async () => {
    set({ weekLoading: true });
    try {
      const { data } = await api.get<PracticeWeekDay[]>('/api/practice/week');
      set({ weekDays: data, weekLoading: false });
    } catch {
      set({ weekLoading: false });
    }
  },

  fetchSessions: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<PracticeSession[]>('/api/practice', { params });
      set({ sessions: data, loading: false });
    } catch {
      set({ error: 'Failed to load sessions', loading: false });
    }
  },

  logSession: async (session: NewSession) => {
    const { data } = await api.post<PracticeSession>('/api/practice', session);
    set((state) => ({ sessions: [data, ...state.sessions] }));
    return data;
  },

  reset: () => set({ sessions: [], weekDays: [], loading: false, weekLoading: false, error: null }),
}));
