import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'all',
      'Grantera.org',
      '8b7ebc8668b2.ngrok-free.app', // This allows all hosts (easiest for ngrok)
      // OR be specific:
      // '6cd63f825b3c.ngrok-free.app',
    ],
  },
})
