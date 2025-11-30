import { Component } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

class LazyErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    if (import.meta.env.DEV) {
      console.error('[LazyErrorBoundary] Component failed to load:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                {this.props.language === 'es' ? 'Error al cargar el componente' : 'Failed to load component'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                {this.props.language === 'es' 
                  ? 'Hubo un problema al cargar esta sección. Por favor, intenta refrescar la página.' 
                  : 'There was a problem loading this section. Please try refreshing the page.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {this.props.language === 'es' ? 'Refrescar página' : 'Refresh page'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to access context
function LazyErrorBoundary({ children }) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  
  return (
    <LazyErrorBoundaryClass language={language}>
      {children}
    </LazyErrorBoundaryClass>
  );
}

export default LazyErrorBoundary;

