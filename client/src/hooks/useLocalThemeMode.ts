import { useLocalThemeStore } from '../store/localThemeStore';
import type { ThemeMode } from '@gmh/shared/types/user';

export function useLocalThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const mode = useLocalThemeStore((s) => s.mode);
  const setMode = useLocalThemeStore((s) => s.setMode);
  return [mode, setMode];
}
