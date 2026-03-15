import { create } from 'zustand';
import api from '../services/api';
import type { PracticeSession, NewSession } from '../types/practice';

interface PracticeState {
  sessions: PracticeSession[];
  loading: boolean;
  error: string | null;
  fetchSessions: (params?: { from?: string; to?: string }) => Promise<void>;
  logSession: (session: NewSession) => Promise<PracticeSession>;
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  sessions: [],
  loading: false,
  error: null,

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

  reset: () => set({ sessions: [], loading: false, error: null }),
}));
