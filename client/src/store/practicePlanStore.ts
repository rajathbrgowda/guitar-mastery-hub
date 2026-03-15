import { create } from 'zustand';
import { api } from '../services/api';
import type { DailyPracticePlan } from '@gmh/shared/types/practice-plan';

interface PracticePlanState {
  todaysPlan: DailyPracticePlan | null;
  isLoading: boolean;
  error: string | null;
  noplan: boolean; // true when server returned 204 (not enough data)

  fetchTodaysPlan: () => Promise<void>;
  completeItem: (itemId: string, actualDurationMin?: number) => Promise<{ allDone: boolean }>;
  skipPlan: () => Promise<void>;
  reset: () => void;
}

export const usePracticePlanStore = create<PracticePlanState>((set, get) => ({
  todaysPlan: null,
  isLoading: false,
  error: null,
  noplan: false,

  fetchTodaysPlan: async () => {
    set({ isLoading: true, error: null, noplan: false });
    try {
      const res = await api.get<DailyPracticePlan>('/api/practice/plan/today', {
        validateStatus: (s) => s === 200 || s === 204,
      });
      if (res.status === 204) {
        set({ todaysPlan: null, noplan: true, isLoading: false });
        return;
      }
      set({ todaysPlan: res.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load your practice plan', isLoading: false });
    }
  },

  completeItem: async (itemId: string, actualDurationMin?: number) => {
    // Optimistic update
    const prev = get().todaysPlan;
    if (prev) {
      const updatedItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, completed: true, completed_at: new Date().toISOString() } : i,
      );
      const allDoneOptimistic = updatedItems.every((i) => i.completed);
      set({
        todaysPlan: {
          ...prev,
          items: updatedItems,
          status: allDoneOptimistic
            ? 'completed'
            : prev.status === 'pending'
              ? 'in_progress'
              : prev.status,
        },
      });
    }

    try {
      const body =
        actualDurationMin !== undefined ? { actual_duration_min: actualDurationMin } : {};
      const { data } = await api.post<{ success: boolean; allDone: boolean }>(
        `/api/practice/plan/today/items/${itemId}/complete`,
        body,
      );

      // Sync authoritative state
      if (data.allDone && get().todaysPlan) {
        set({ todaysPlan: { ...get().todaysPlan!, status: 'completed' } });
      }

      return { allDone: data.allDone };
    } catch {
      // Revert optimistic update on failure
      if (prev) set({ todaysPlan: prev });
      throw new Error('Failed to mark item complete');
    }
  },

  skipPlan: async () => {
    try {
      await api.post('/api/practice/plan/today/skip', {});
      const current = get().todaysPlan;
      if (current) set({ todaysPlan: { ...current, status: 'skipped' } });
    } catch {
      throw new Error('Failed to skip plan');
    }
  },

  reset: () => set({ todaysPlan: null, isLoading: false, error: null, noplan: false }),
}));
