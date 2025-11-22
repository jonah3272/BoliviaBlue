import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder after build
    // Commented out to fix dev server startup - only needed for production builds
    // visualizer({
    //   filename: './dist/stats.html',
    //   open: false,
    //   gzipSize: true,
    //   brotliSize: true,
    // })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunking to let Vite handle it automatically
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2015',
  }
});

