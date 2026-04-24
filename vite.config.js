import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/smart-query-service/api'),
        // SSE support — critical for /ask-stream
        timeout: 0,           // no proxy timeout (NVIDIA can take 30-60s)
        proxyTimeout: 0,      // no proxy response timeout
        configure: (proxy) => {
          // Disable buffering for SSE responses
          proxy.on('proxyRes', (proxyRes, req) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              // Force no-buffering for SSE
              proxyRes.headers['cache-control'] = 'no-cache';
              proxyRes.headers['x-accel-buffering'] = 'no';
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
