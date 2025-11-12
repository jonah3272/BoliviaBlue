import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
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
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Chart library
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          // Supabase client
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          // React Helmet
          if (id.includes('react-helmet')) {
            return 'helmet-vendor';
          }
          // Large node_modules dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    // Enable source maps for production debugging (optional, can be disabled)
    sourcemap: false,
    // Optimize chunk loading
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'es2015',
  }
});

