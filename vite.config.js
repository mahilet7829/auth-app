// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,           // ← pick any free port you like (3000, 5173, 4000...)
    strictPort: true,     // ← very important: if port taken → fail instead of auto-increment
    hmr: {
      host: 'localhost',  // helps in some network/proxy cases
    }
  }
})