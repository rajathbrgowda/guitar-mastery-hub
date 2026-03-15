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

export const useUserStore = create<UserStoreState>((set) => ({
  profile: null,
  loading: false,

  fetchProfile: async () => {
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
    const { data } = await api.patch<UserProfile>('/api/users/me', patch);
    set({ profile: data });
  },

  reset: () => set({ profile: null, loading: false }),
}));
