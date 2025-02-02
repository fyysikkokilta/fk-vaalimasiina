/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/trpc': {
        target: process.env.BASE_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    EnvironmentPlugin({
      BRANDING_HEADER_TITLE_TEXT: 'Vaalimasiina',
      BRANDING_FOOTER_HOME_LINK: 'https://fyysikkokilta.fi',
      BRANDING_FOOTER_HOME_TEXT: 'fyysikkokilta.fi',
      BASE_URL: 'http://localhost:3000'
    }),
    visualizer({ open: true })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      treeshake: true,
      output: {
        entryFileNames: `assets/index.js`,
        chunkFileNames: `assets/index-chunk.js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
})
