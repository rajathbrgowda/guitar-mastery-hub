import { create } from 'zustand';
import api from '../services/api';
import type { SkillProgress } from '../types/progress';

interface ToggleSkillResponse extends SkillProgress {
  phase_completed: boolean;
  new_phase: number | null;
}

interface ProgressStoreState {
  skills: SkillProgress[];
  currentPhase: number;
  loading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  toggleSkill: (phase_index: number, skill_index: number, completed: boolean) => Promise<void>;
  setPhase: (phase: number) => Promise<void>;
  reset: () => void;
}

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  skills: [],
  currentPhase: 0,
  loading: false,
  error: null,

  fetchProgress: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<{ skills: SkillProgress[]; currentPhase: number }>(
        '/api/progress',
      );
      set({ skills: data.skills, currentPhase: data.currentPhase, loading: false });
    } catch {
      set({ error: 'Failed to load progress', loading: false });
    }
  },

  toggleSkill: async (phase_index, skill_index, completed) => {
    // Optimistic update
    const prev = get().skills;
    set((state) => {
      const existing = state.skills.find(
        (s) => s.phase_index === phase_index && s.skill_index === skill_index,
      );
      if (existing) {
        return {
          skills: state.skills.map((s) =>
            s.phase_index === phase_index && s.skill_index === skill_index
              ? { ...s, completed, completed_at: completed ? new Date().toISOString() : null }
              : s,
          ),
        };
      }
      // Not yet in DB — add locally
      return {
        skills: [
          ...state.skills,
          {
            id: `local-${phase_index}-${skill_index}`,
            phase_index,
            skill_index,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
        ],
      };
    });

    try {
      const { data } = await api.patch<ToggleSkillResponse>('/api/progress/skill', {
        phase_index,
        skill_index,
        completed,
      });
      // Replace local entry with real DB row; advance phase if server signals completion
      set((state) => ({
        skills: state.skills.map((s) =>
          s.phase_index === phase_index && s.skill_index === skill_index ? data : s,
        ),
        currentPhase:
          data.phase_completed && data.new_phase != null ? data.new_phase : state.currentPhase,
      }));
    } catch {
      // Roll back
      set({ skills: prev });
    }
  },

  setPhase: async (phase) => {
    const prevPhase = get().currentPhase;
    set({ currentPhase: phase });
    try {
      await api.patch('/api/progress/phase', { current_phase: phase });
    } catch {
      set({ currentPhase: prevPhase });
    }
  },

  reset: () => set({ skills: [], currentPhase: 0, loading: false, error: null }),
}));
