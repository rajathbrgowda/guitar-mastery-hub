import { create } from 'zustand';
import { onBackendStatus } from '../services/api';

export type BackendStatus = 'unknown' | 'warming' | 'ready' | 'unreachable';

interface BackendStatusState {
  status: BackendStatus;
  setStatus: (s: BackendStatus) => void;
}

export const useBackendStatusStore = create<BackendStatusState>((set) => ({
  status: 'unknown',
  setStatus: (status) => set({ status }),
}));

// Wire the axios interceptor callback into this store
onBackendStatus((status) => {
  useBackendStatusStore.getState().setStatus(status);
});

const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Proactively ping /api/health on SPA load so we discover cold-start
 * before the first authenticated API call. Non-blocking — runs in background.
 */
export async function preflightHealthCheck(): Promise<void> {
  const store = useBackendStatusStore.getState();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      store.setStatus('ready');
      return;
    }
    // 503 = warming
    store.setStatus('warming');
  } catch {
    store.setStatus('warming');
  }

  // Retry every 3s until ready (max 10 attempts = 30s)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const res = await fetch(`${API_URL}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        store.setStatus('ready');
        return;
      }
    } catch {
      // keep retrying
    }
  }

  store.setStatus('unreachable');
}
