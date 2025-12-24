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
            // Recharts is MASSIVE - isolate it completely (only loaded when chart is rendered)
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'charts-vendor';
            }
            // Lightweight charts (alternative chart library)
            if (id.includes('lightweight-charts')) {
              return 'lightweight-charts-vendor';
            }
            // Framer Motion animations (only used in some components)
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            // Supabase - large library, separate chunk
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // React Helmet - separate for better caching
            if (id.includes('react-helmet')) {
              return 'helmet-vendor';
            }
            // SWR - data fetching library
            if (id.includes('swr')) {
              return 'swr-vendor';
            }
            // Everything else
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold to catch large chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'], // Remove specific console calls
        passes: 2, // Multiple passes for better optimization
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2015',
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Enable tree-shaking more aggressively
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  }
});

