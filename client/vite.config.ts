import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gmh/shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: true, // bind to 0.0.0.0 so Docker can expose the port
    port: 5173,
    watch: {
      usePolling: true, // required for hot-reload inside Docker on macOS
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/setupTests.ts'],
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_API_URL: 'http://localhost:4000',
    },
  },
});
