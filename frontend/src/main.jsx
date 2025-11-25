import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './styles/ui-enhancements.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { loadAdSense } from './utils/adsenseLoader';

// Suppress annoying development warnings
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const msg = args[0];
    // Filter out preload warnings - these are harmless Vite optimization warnings
    if (msg && typeof msg === 'string' && msg.includes('preloaded using link preload')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const msg = args[0];
    // Filter out framer-motion/router async conflicts - harmless in production
    if (msg && typeof msg === 'string' && 
        (msg.includes('message channel closed') || 
         msg.includes('listener indicated an asynchronous response'))) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Register service worker for offline support and caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Load AdSense after page is fully loaded
window.addEventListener('load', () => {
  console.log('[AdSense] Page fully loaded, starting content validation...');
  setTimeout(() => {
    loadAdSense('ca-pub-3497294777171749');
  }, 1500);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

