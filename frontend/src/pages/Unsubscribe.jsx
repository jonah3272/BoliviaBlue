import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';

function Unsubscribe() {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const t = languageContext?.t || ((key) => key || '');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Unsubscribe
    fetch('/api/alerts/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch((error) => {
        console.error('Error unsubscribing:', error);
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' ? 'Cancelar Alerta - Bolivia Blue con Paz' : 'Unsubscribe Alert - Bolivia Blue with Paz'}
        description={language === 'es'
          ? "Cancela tu alerta de tipo de cambio"
          : "Unsubscribe from exchange rate alerts"}
        canonical="/unsubscribe"
      />
      
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t('title')}
                </div>
                <p className="hidden md:block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </Link>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Cancelando alerta...' : 'Unsubscribing...'}
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Alerta Cancelada' : 'Alert Unsubscribed'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? 'Tu alerta ha sido cancelada exitosamente. Ya no recibirás más notificaciones.'
                  : 'Your alert has been successfully canceled. You will no longer receive notifications.'}
              </p>
              <Link
                to="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Error' : 'Error'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {language === 'es'
                  ? 'No se pudo cancelar la alerta. El enlace puede ser inválido o haber expirado.'
                  : 'Could not unsubscribe. The link may be invalid or expired.'}
              </p>
              <Link
                to="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Unsubscribe;

