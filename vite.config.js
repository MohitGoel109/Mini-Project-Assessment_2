import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Screen capture (getDisplayMedia) requires a secure context.
    // Vite's dev server on localhost counts as secure; for LAN/HTTPS testing
    // supply your own cert via server.https.
    port: 5173
  }
})
