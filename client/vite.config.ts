import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Fretwork — Guitar Practice Tracker',
        short_name: 'Fretwork',
        description: 'Track your guitar practice. See yourself improve.',
        theme_color: '#ea580c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/app',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          {
            src: '/icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all built assets
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Runtime caching strategies for API calls
        runtimeCaching: [
          {
            // Stale-While-Revalidate for roadmap (curriculum data changes rarely)
            urlPattern: /\/api\/roadmap$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-roadmap',
              expiration: { maxEntries: 5, maxAgeSeconds: 86400 }, // 24h
            },
          },
          {
            // Stale-While-Revalidate for today's practice plan
            urlPattern: /\/api\/practice\/plan\/today$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-practice-plan',
              expiration: { maxEntries: 3, maxAgeSeconds: 86400 },
            },
          },
          {
            // Stale-While-Revalidate for analytics summary
            urlPattern: /\/api\/analytics\/summary$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-analytics-summary',
              expiration: { maxEntries: 3, maxAgeSeconds: 3600 }, // 1h
            },
          },
          {
            // Network-First for user profile (needs fresh data)
            urlPattern: /\/api\/users\/me$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-user-profile',
              expiration: { maxEntries: 1, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@gmh/shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
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
