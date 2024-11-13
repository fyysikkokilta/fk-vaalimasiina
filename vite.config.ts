import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass
      }
    }
  }
})
