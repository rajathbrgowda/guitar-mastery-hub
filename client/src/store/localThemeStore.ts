import { create } from 'zustand';
import type { ThemeMode } from '@gmh/shared/types/user';

const KEY = 'gmh_theme_mode';

function getStored(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // ignore
  }
  return 'light';
}

interface LocalThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

export const useLocalThemeStore = create<LocalThemeState>((set) => ({
  mode: getStored(),
  setMode: (m) => {
    set({ mode: m });
    try {
      localStorage.setItem(KEY, m);
    } catch {
      // ignore
    }
  },
}));
