import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchBlueRate } from '../utils/api';

function RateAlertForm() {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [rateData, setRateData] = useState(null);

  const [email, setEmail] = useState('');
  const [alertType, setAlertType] = useState('both'); // 'buy', 'sell', 'both'
  const [direction, setDirection] = useState('above'); // 'above', 'below'
  const [threshold, setThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');

  // Load current rate
  useEffect(() => {
    const loadRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data) {
          setRateData({
            buy: data.buy_bob_per_usd || data.buy,
            sell: data.sell_bob_per_usd || data.sell,
            mid: data.mid_bob_per_usd || data.mid,
          });
        }
      } catch (error) {
        console.error('Error loading rate:', error);
      }
    };
    loadRate();
  }, []);

  // Auto-fill threshold with current rate when alert type or direction changes
  useEffect(() => {
    if (rateData && !threshold) {
      let currentRate = 0;
      if (alertType === 'buy' && rateData.buy) {
        currentRate = rateData.buy;
      } else if (alertType === 'sell' && rateData.sell) {
        currentRate = rateData.sell;
      } else if (alertType === 'both' && rateData.mid) {
        currentRate = rateData.mid;
      }
      
      if (currentRate > 0) {
        setThreshold(currentRate.toFixed(2));
      }
    }
  }, [rateData, alertType, threshold]);

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

    if (!threshold || isNaN(threshold) || parseFloat(threshold) <= 0) {
      setStatus('error');
      setMessage(
        language === 'es'
          ? 'Por favor, ingresa un umbral válido'
          : 'Please enter a valid threshold'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          alert_type: alertType,
          threshold: parseFloat(threshold),
          direction,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(
          language === 'es'
            ? '¡Alerta creada exitosamente! Te notificaremos cuando el tipo de cambio alcance tu umbral.'
            : 'Alert created successfully! We will notify you when the exchange rate reaches your threshold.'
        );
        // Reset form
        setEmail('');
        setThreshold('');
      } else {
        setStatus('error');
        setMessage(
          data.message ||
          (language === 'es'
            ? 'Error al crear la alerta. Por favor, intenta de nuevo.'
            : 'Error creating alert. Please try again.')
        );
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setStatus('error');
      setMessage(
        language === 'es'
          ? 'Error al procesar la solicitud. Por favor, intenta de nuevo más tarde.'
          : 'Error processing request. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentRateDisplay = () => {
    if (!rateData) return null;
    
    if (alertType === 'buy' && rateData.buy) {
      return rateData.buy.toFixed(2);
    } else if (alertType === 'sell' && rateData.sell) {
      return rateData.sell.toFixed(2);
    } else if (alertType === 'both' && rateData.mid) {
      return rateData.mid.toFixed(2);
    }
    return null;
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border-2 border-indigo-200 dark:border-indigo-800">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? '🔔 Alertas de Precio' : '🔔 Price Alerts'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {language === 'es'
              ? 'Recibe notificaciones por email cuando el tipo de cambio alcance tu umbral'
              : 'Get email notifications when the exchange rate reaches your threshold'}
          </p>
        </div>

        {/* Current Rate Display */}
        {rateData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Tasa actual' : 'Current rate'}:
              </span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {getCurrentRateDisplay()} BOB
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="alert-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {language === 'es' ? 'Email' : 'Email Address'}
            </label>
            <input
              type="email"
              id="alert-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
            />
          </div>

          {/* Alert Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'es' ? 'Tipo de alerta' : 'Alert Type'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'buy', label: language === 'es' ? 'Compra' : 'Buy' },
                { value: 'sell', label: language === 'es' ? 'Venta' : 'Sell' },
                { value: 'both', label: language === 'es' ? 'Ambos' : 'Both' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAlertType(option.value)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    alertType === option.value
                      ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direction Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'es' ? 'Dirección' : 'Direction'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'above',
                  label: language === 'es' ? 'Por encima' : 'Above',
                  icon: '↑',
                },
                {
                  value: 'below',
                  label: language === 'es' ? 'Por debajo' : 'Below',
                  icon: '↓',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDirection(option.value)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    direction === option.value
                      ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }`}
                >
                  <span className="text-xl mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold Input */}
          <div>
            <label
              htmlFor="alert-threshold"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {language === 'es' ? 'Umbral (BOB)' : 'Threshold (BOB)'}
            </label>
            <input
              type="number"
              id="alert-threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder={getCurrentRateDisplay() || '0.00'}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {language === 'es'
                ? `Te notificaremos cuando la tasa ${direction === 'above' ? 'suba' : 'baje'} a ${threshold || 'este valor'} BOB`
                : `We'll notify you when the rate goes ${direction === 'above' ? 'above' : 'below'} ${threshold || 'this value'} BOB`}
            </p>
          </div>

          {/* Status Messages */}
          {status && (
            <div
              className={`p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  status === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {language === 'es' ? 'Creando alerta...' : 'Creating alert...'}
              </span>
            ) : (
              language === 'es' ? 'Crear Alerta' : 'Create Alert'
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {language === 'es'
              ? 'Solo usaremos tu email para enviarte alertas. Puedes cancelar en cualquier momento desde el link en el email.'
              : 'We will only use your email to send alerts. You can unsubscribe anytime from the link in the email.'}
          </p>
        </form>
      </div>
    </section>
  );
}

export default RateAlertForm;
