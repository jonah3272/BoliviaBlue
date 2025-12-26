import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getApiEndpoint } from '../utils/apiUrl';
import { trackEvent } from '../utils/analytics';

function NewsletterSignup({ source = 'homepage', compact = false }) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setMessage('');

    // Validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(
        language === 'es'
          ? 'Por favor, ingresa un email válido'
          : 'Please enter a valid email address'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(getApiEndpoint('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for CORS
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify({
          email,
          language,
          source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(
          language === 'es'
            ? '¡Suscripción exitosa! Revisa tu correo para confirmar.'
            : 'Subscription successful! Check your email to confirm.'
        );
        setEmail('');
        trackEvent('newsletter', 'subscribe', { source, language });
      } else {
        setStatus('error');
        setMessage(
          data.message ||
          (language === 'es'
            ? 'Error al suscribirse. Por favor, intenta de nuevo.'
            : 'Error subscribing. Please try again.')
        );
        trackEvent('newsletter', 'subscribe_error', { source, error: data.message });
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setMessage(
        language === 'es'
          ? 'Error al procesar la solicitud. Por favor, intenta de nuevo más tarde.'
          : 'Error processing request. Please try again later.'
      );
      trackEvent('newsletter', 'subscribe_error', { source, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={language === 'es' ? 'Tu email' : 'Your email'}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (language === 'es' ? 'Enviando...' : 'Sending...')
              : (language === 'es' ? 'Suscribirse' : 'Subscribe')}
          </button>
        </form>
        {status && (
          <p
            className={`mt-2 text-sm ${
              status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border-2 border-blue-200 dark:border-blue-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {language === 'es' ? '📧 Boletín Semanal' : '📧 Weekly Newsletter'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          {language === 'es'
            ? 'Recibe un resumen semanal con las tasas actuales, tendencias del mercado y noticias destacadas.'
            : 'Receive a weekly summary with current rates, market trends and top news.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="newsletter-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {language === 'es' ? 'Email' : 'Email Address'}
          </label>
          <input
            type="email"
            id="newsletter-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting
            ? (language === 'es' ? 'Enviando...' : 'Sending...')
            : (language === 'es' ? 'Suscribirse al Boletín' : 'Subscribe to Newsletter')}
        </button>
      </form>

      {status && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <p
            className={`text-sm ${
              status === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {language === 'es'
          ? 'Puedes cancelar tu suscripción en cualquier momento.'
          : 'You can unsubscribe at any time.'}
      </p>
    </section>
  );
}

export default NewsletterSignup;


