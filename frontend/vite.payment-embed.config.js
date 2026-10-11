import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// An isolated entry: do not import main.jsx, app providers, ads, or rate clients.
// Only this subdirectory is cleared, after the normal app build completes.
export default defineConfig({
  publicDir: false,
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  css: {
    postcss: {
      plugins: [tailwindcss({
        content: ['./src/components/PaymentCostChecker.jsx', './src/embeds/paymentCostEmbed.jsx'],
        darkMode: 'class',
        theme: { extend: { fontFamily: { sans: ['system-ui', 'sans-serif'], mono: ['ui-monospace', 'monospace'] } } },
      }), autoprefixer()],
    },
  },
  build: {
    outDir: 'dist/payment-cost',
    emptyOutDir: true,
    target: 'es2015',
    cssCodeSplit: false,
    lib: {
      entry: 'src/embeds/paymentCostEmbed.jsx',
      name: 'BoliviaBluePaymentCost',
      formats: ['iife'],
      fileName: () => 'payment-cost.js',
    },
    rollupOptions: { output: { assetFileNames: 'payment-cost.[ext]' } },
  },
});
