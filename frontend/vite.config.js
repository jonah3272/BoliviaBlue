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
        manualChunks: (id) => {
          // Recharts is HUGE - isolate it
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          // React Router - separate for better caching
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          // Core React - most stable, best caching
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core';
          }
          // Supabase client
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          // React Helmet
          if (id.includes('react-helmet')) {
            return 'helmet-vendor';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser', // Terser is better than esbuild for production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    sourcemap: false, // Disable source maps for smaller bundles
    cssCodeSplit: true,
    target: 'es2015',
    // Enable tree shaking
    treeshake: true,
    // Optimize chunk loading
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  }
});

