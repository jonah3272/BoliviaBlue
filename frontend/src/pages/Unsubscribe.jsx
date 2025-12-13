import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';

function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const t = languageContext?.t || ((key) => key || '');

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(
        language === 'es'
          ? 'Token de cancelación no válido o faltante.'
          : 'Invalid or missing unsubscribe token.'
      );
      return;
    }

    // Call unsubscribe API
    const unsubscribe = async () => {
      try {
        const response = await fetch('/api/alerts/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(
            language === 'es'
              ? 'Has cancelado tu alerta exitosamente. Ya no recibirás más notificaciones.'
              : 'You have successfully unsubscribed. You will no longer receive notifications.'
          );
        } else {
          setStatus('error');
          setMessage(
            language === 'es'
              ? 'Error al cancelar la alerta. El token puede ser inválido o la alerta ya fue cancelada.'
              : 'Error unsubscribing. The token may be invalid or the alert has already been cancelled.'
          );
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setStatus('error');
        setMessage(
          language === 'es'
            ? 'Error al procesar la solicitud. Por favor, intenta de nuevo más tarde.'
            : 'Error processing request. Please try again later.'
        );
      }
    };

    unsubscribe();
  }, [searchParams, language]);

  return (
    <>
      <PageMeta
        title={language === 'es' ? 'Cancelar Alerta - Bolivia Blue con Paz' : 'Unsubscribe - Bolivia Blue con Paz'}
        description={
          language === 'es'
            ? 'Cancela tus alertas de tipo de cambio'
            : 'Unsubscribe from exchange rate alerts'
        }
        canonical="/unsubscribe"
      />
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {language === 'es' ? 'Procesando...' : 'Processing...'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'es'
                    ? 'Cancelando tu alerta...'
                    : 'Unsubscribing from alerts...'}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {language === 'es' ? '¡Cancelación Exitosa!' : 'Successfully Unsubscribed!'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {language === 'es' ? 'Error' : 'Error'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Unsubscribe;

