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
          // Split vendor bundles more aggressively to reduce unused JS
          if (id.includes('node_modules')) {
            // Core React libs - small, stable
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Router - separate for better caching
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Recharts is MASSIVE - isolate it completely
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'charts-vendor';
            }
            // Framer Motion animations
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            // Everything else
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console calls
      },
    },
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2015',
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  }
});

