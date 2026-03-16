import { create } from 'zustand';
import { api } from '../services/api';
import type { RoadmapResponse } from '@gmh/shared/types/roadmap';
import type { ConfidenceRating } from '@gmh/shared/types/practice-plan';

interface RoadmapState {
  data: RoadmapResponse | null;
  loading: boolean;
  error: string;
  fetchRoadmap: () => Promise<void>;
  /** Optimistic local update for skill confidence — used by SkillDetailDrawer */
  updateSkillConfidence: (skillKey: string, confidence: ConfidenceRating) => void;
  reset: () => void;
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
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
  updateSkillConfidence: (skillKey, confidence) => {
    const data = get().data;
    if (!data) return;
    set({
      data: {
        ...data,
        phases: data.phases.map((phase) => ({
          ...phase,
          skills: phase.skills.map((s) => (s.skill_key === skillKey ? { ...s, confidence } : s)),
        })),
      },
    });
  },
  reset: () => set({ data: null, loading: false, error: '' }),
}));
