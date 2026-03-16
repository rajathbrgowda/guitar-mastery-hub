import { useState, useCallback } from 'react';
import type { ThemeMode } from '@gmh/shared/types/user';

const KEY = 'gmh_theme_mode';

function getStored(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export function useLocalThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setModeState] = useState<ThemeMode>(getStored);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {
      // ignore storage errors
    }
  }, []);

  return [mode, setMode];
}
