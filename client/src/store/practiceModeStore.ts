import { create } from 'zustand';
import { api } from '../services/api';
import type { ConfidenceRating } from '@gmh/shared/types/practice-plan';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'rating' | 'done';

interface PracticeModeState {
  currentItemIndex: number;
  timerStatus: TimerStatus;
  /** itemId → confidence rating submitted */
  ratings: Record<string, ConfidenceRating>;
  /** itemId → actual elapsed seconds (set when timer ends or item is skipped) */
  elapsed: Record<string, number>;
  /** Set when submitRating API call fails; cleared on next attempt or resetSession */
  submitError: string | null;

  startSession: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  clearSubmitError: () => void;
  /** Called when timer ends naturally — show confidence rating overlay */
  timerComplete: (itemId: string, elapsedSec: number) => void;
  /** User tapped Done manually — same as timer complete */
  markDone: (itemId: string, elapsedSec: number) => void;
  /** User rated confidence — persist to API and advance */
  submitRating: (
    itemId: string,
    rating: ConfidenceRating,
    elapsedSec: number,
    totalItems: number,
  ) => Promise<void>;
  /** User skipped item — no rating, just advance */
  skipItem: (totalItems: number) => void;
  resetSession: () => void;
}

export const usePracticeModeStore = create<PracticeModeState>((set, get) => ({
  currentItemIndex: 0,
  timerStatus: 'idle',
  ratings: {},
  elapsed: {},
  submitError: null,

  startSession: () =>
    set({
      currentItemIndex: 0,
      timerStatus: 'running',
      ratings: {},
      elapsed: {},
      submitError: null,
    }),

  pauseTimer: () => set({ timerStatus: 'paused' }),

  resumeTimer: () => set({ timerStatus: 'running' }),

  clearSubmitError: () => set({ submitError: null }),

  timerComplete: (itemId, elapsedSec) => {
    set((s) => ({ elapsed: { ...s.elapsed, [itemId]: elapsedSec }, timerStatus: 'rating' }));
  },

  markDone: (itemId, elapsedSec) => {
    set((s) => ({ elapsed: { ...s.elapsed, [itemId]: elapsedSec }, timerStatus: 'rating' }));
  },

  submitRating: async (itemId, rating, elapsedSec, totalItems) => {
    set({ submitError: null });
    // Optimistic: record rating and elapsed locally
    set((s) => ({
      ratings: { ...s.ratings, [itemId]: rating },
      elapsed: { ...s.elapsed, [itemId]: elapsedSec },
    }));

    const actualMin = Math.max(1, Math.round(elapsedSec / 60));
    try {
      await api.post(`/api/practice/plan/today/items/${itemId}/complete`, {
        actual_duration_min: actualMin,
        confidence_rating: rating,
      });
    } catch {
      // Revert optimistic rating and stay on rating screen so user can retry
      set((s) => {
        const ratings = { ...s.ratings };
        delete ratings[itemId];
        return { ratings, submitError: 'Failed to save rating. Tap a rating to retry.' };
      });
      return;
    }

    const nextIndex = get().currentItemIndex + 1;
    if (nextIndex >= totalItems) {
      set({ timerStatus: 'done', currentItemIndex: nextIndex });
    } else {
      set({ timerStatus: 'running', currentItemIndex: nextIndex });
    }
  },

  skipItem: (totalItems) => {
    const nextIndex = get().currentItemIndex + 1;
    if (nextIndex >= totalItems) {
      set({ timerStatus: 'done', currentItemIndex: nextIndex });
    } else {
      set({ currentItemIndex: nextIndex, timerStatus: 'running' });
    }
  },

  resetSession: () =>
    set({ currentItemIndex: 0, timerStatus: 'idle', ratings: {}, elapsed: {}, submitError: null }),
}));
