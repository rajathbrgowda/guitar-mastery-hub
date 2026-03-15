import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // bind to 0.0.0.0 so Docker can expose the port
    port: 5173,
    watch: {
      usePolling: true, // required for hot-reload inside Docker on macOS
    },
  },
})
