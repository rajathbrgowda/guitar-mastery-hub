import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';

// --- Cold-start retry config ---
const MAX_RETRIES = 3;
// Exponential backoff: 2s, 6s, 14s (total ≈22s, covers typical 20-30s Render cold start)
const BACKOFF_BASE_MS = 2000;

const RETRYABLE_STATUS = new Set([502, 503, 504]);

interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}

/** Called by the retry interceptor when cold-start retrying begins/ends. */
type BackendStatusCallback = (status: 'warming' | 'ready' | 'unreachable') => void;
let statusCallback: BackendStatusCallback | undefined;

/** Register a listener for backend status changes (used by backendStatusStore). */
export function onBackendStatus(cb: BackendStatusCallback): void {
  statusCallback = cb;
}

function notifyStatus(status: 'warming' | 'ready' | 'unreachable'): void {
  statusCallback?.(status);
}

function isRetryable(error: AxiosError): boolean {
  // Network error (no response at all — Render container not up yet)
  if (!error.response && error.code !== 'ERR_CANCELED') return true;
  // Timeout
  if (error.code === 'ECONNABORTED') return true;
  // Proxy errors from Render while container starts
  if (error.response && RETRYABLE_STATUS.has(error.response.status)) return true;
  return false;
}

// ─── Axios instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000, // 10s — prevents hanging forever on cold-start
});

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

// --- Retry interceptor (runs BEFORE the 401 interceptor) ---
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryConfig | undefined;
  if (!config) return Promise.reject(error);

  const retryCount = config.__retryCount ?? 0;

  if (isRetryable(error) && retryCount < MAX_RETRIES) {
    config.__retryCount = retryCount + 1;

    // Notify UI that backend is warming up
    if (retryCount === 0) notifyStatus('warming');

    const delay = BACKOFF_BASE_MS * (Math.pow(2, retryCount) - 1) + BACKOFF_BASE_MS;
    await new Promise((r) => setTimeout(r, delay));

    return api.request(config);
  }

  // All retries exhausted on a retryable error → unreachable
  if (isRetryable(error)) {
    notifyStatus('unreachable');
  }

  return Promise.reject(error);
});

// --- 401 interceptor: session expired → sign out ---
api.interceptors.response.use(
  (response) => {
    // If we get a successful response, backend is ready
    notifyStatus('ready');
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login?error=session_expired';
    }
    return Promise.reject(error);
  },
);

export { api };
export default api;
