import { create } from 'zustand';
import { api } from '../services/api';
import type { Milestone, MilestonesResponse } from '@gmh/shared/types/milestones';

const SEEN_KEY = 'milestone_seen';

function getSeenSet(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function addToSeenSet(key: string): void {
  try {
    const seen = getSeenSet();
    seen.add(key);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore storage errors
  }
}

interface MilestoneState {
  milestones: Milestone[];
  earnedCount: number;
  totalCount: number;
  newlyEarned: Milestone | null;
  isLoading: boolean;
  error: string | null;

  fetchMilestones: () => Promise<void>;
  dismissCelebration: () => void;
  reset: () => void;
}

export const useMilestoneStore = create<MilestoneState>((set) => ({
  milestones: [],
  earnedCount: 0,
  totalCount: 12,
  newlyEarned: null,
  isLoading: false,
  error: null,

  fetchMilestones: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<MilestonesResponse>('/api/milestones');
      const seen = getSeenSet();

      // Find the first earned milestone not yet seen
      const newlyEarned = data.milestones.find((m) => m.earned && !seen.has(m.key)) ?? null;
      if (newlyEarned) {
        addToSeenSet(newlyEarned.key);
      }

      set({
        milestones: data.milestones,
        earnedCount: data.earned_count,
        totalCount: data.total_count,
        newlyEarned,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Could not load milestones.' });
    }
  },

  dismissCelebration: () => set({ newlyEarned: null }),

  reset: () =>
    set({
      milestones: [],
      earnedCount: 0,
      totalCount: 12,
      newlyEarned: null,
      isLoading: false,
      error: null,
    }),
}));
