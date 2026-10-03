import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '172.18.0.1',
    port: 3060,
  },
  preview: {
    host: '172.18.0.1',
    port: 3060,
  },
})
