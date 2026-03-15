import { create } from 'zustand';
import api from '../services/api';
import { UserProfile } from '../types/user';

interface UserStoreState {
  profile: UserProfile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<UserProfile, 'id' | 'email' | 'current_phase' | 'created_at'>>) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  profile: null,
  loading: false,

  fetchProfile: async () => {
    // Skip if already loaded (called from multiple mount points)
    if (get().profile) return;
    set({ loading: true });
    try {
      const { data } = await api.get<UserProfile>('/api/users/me');
      set({ profile: data });
    } catch {
      // non-blocking — profile stays null
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (patch) => {
    const prev = get().profile;
    // Optimistic update — apply immediately so theme/UI changes feel instant
    if (prev) set({ profile: { ...prev, ...patch } as UserProfile });
    try {
      const { data } = await api.patch<UserProfile>('/api/users/me', patch);
      // Confirm with server data (server is source of truth)
      set({ profile: data });
    } catch (err) {
      // Roll back to previous state on failure
      set({ profile: prev });
      throw err;
    }
  },

  reset: () => set({ profile: null, loading: false }),
}));
