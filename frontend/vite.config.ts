import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // Tailwind v4 runs as a Vite plugin — no tailwind.config.ts needed
  ],
  server: {
    // Docker on Windows: bind-mounted files don't emit native fs events into the container,
    // so Vite never sees code changes. Polling every 300ms catches them.
    watch: { usePolling: true, interval: 300 },
  },
})
