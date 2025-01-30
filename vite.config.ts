/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
})
