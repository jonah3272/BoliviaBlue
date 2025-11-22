import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './styles/ui-enhancements.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
// import { ToastProvider } from './contexts/ToastContext'; // Temporarily disabled
import { loadAdSense } from './utils/adsenseLoader';

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
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

