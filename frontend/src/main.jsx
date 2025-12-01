import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './styles/ui-enhancements.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ToastProvider } from './contexts/ToastContext';
import { loadAdSense } from './utils/adsenseLoader';

// Global error handler for mobile debugging
window.addEventListener('error', (event) => {
  console.error('[Global Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

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

// Unregister any existing service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('[SW] Service worker unregistered successfully');
          // Force reload to clear cache
          window.location.reload();
        }
      });
    }
  });
}

// Load AdSense after page is fully loaded
window.addEventListener('load', () => {
  console.log('[AdSense] Page fully loaded, starting content validation...');
  setTimeout(() => {
    loadAdSense('ca-pub-3497294777171749');
  }, 1500);
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary]', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#0d0d0d',
          color: '#fff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>🔧 Oops! Algo salió mal</h1>
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
              Hubo un error al cargar la aplicación. Por favor, intenta refrescar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Refrescar Página
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details style={{ 
                marginTop: '30px', 
                textAlign: 'left', 
                backgroundColor: '#1a1a1a', 
                padding: '15px', 
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
                  Ver detalles del error (Modo desarrollo)
                </summary>
                <pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[Fatal Error] Root element not found! #root is missing from index.html');
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: #0d0d0d; color: #fff; font-family: sans-serif; text-align: center;">
      <div>
        <h1>Error Fatal</h1>
        <p>No se pudo inicializar la aplicación. Por favor, contacta al administrador.</p>
      </div>
    </div>
  `;
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </ThemeProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

