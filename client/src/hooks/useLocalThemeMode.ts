import { useState, useEffect } from 'react';
import type { ThemeMode } from '@gmh/shared/types/user';

const KEY = 'gmh_theme_mode';

// Module-level singleton — all hook instances share the same value.
// When one instance calls setLocalMode(), every mounted instance re-renders.
let current: ThemeMode = (() => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // ignore storage errors
  }
  return 'light';
})();

const listeners = new Set<(m: ThemeMode) => void>();

function broadcast(m: ThemeMode) {
  current = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    // ignore storage errors
  }
  listeners.forEach((fn) => fn(m));
}

export function useLocalThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(current);

  useEffect(() => {
    listeners.add(setMode);
    return () => {
      listeners.delete(setMode);
    };
  }, []);

  return [mode, broadcast];
}
