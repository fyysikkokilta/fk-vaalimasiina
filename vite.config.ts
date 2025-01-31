/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin({
      BRANDING_HEADER_TITLE_TEXT: 'Vaalimasiina',
      BRANDING_FOOTER_HOME_LINK: 'https://fyysikkokilta.fi',
      BRANDING_FOOTER_HOME_TEXT: 'fyysikkokilta.fi',
      BASE_URL: 'http://localhost:3000',
      DEV: 'true'
    })
  ],
  build: {
    target: 'esnext',
    sourcemap: true
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
})
