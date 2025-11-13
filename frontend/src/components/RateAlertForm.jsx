import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchBlueRate } from '../utils/api';

function RateAlertForm() {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const t = languageContext?.t || ((key) => key || '');

  const [email, setEmail] = useState('');
  const [alertType, setAlertType] = useState('buy');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState('above');
  const [status, setStatus] = useState(''); // '', 'sending', 'success', 'error'
  const [currentRate, setCurrentRate] = useState(null);

  // Fetch current rate on mount
  useEffect(() => {
    fetchBlueRate().then(rate => {
      if (rate && rate.buy && rate.sell) {
        setCurrentRate(rate);
        // Set default threshold to current rate if not set
        if (!threshold) {
          setThreshold(rate[alertType]?.toFixed(2) || '');
        }
      }
    }).catch(console.error);
  }, [alertType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !threshold) {
      setStatus('error');
      return;
    }

    setStatus('sending');

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

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setThreshold('');
        // Reset form after 3 seconds
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('error');
        console.error('Error creating alert:', data);
      }
    } catch (error) {
      console.error('Error submitting alert:', error);
      setStatus('error');
    }
  };

  const getCurrentRateText = () => {
    if (!currentRate) return '';
    const rate = currentRate[alertType];
    if (!rate) return '';
    return language === 'es' 
      ? `(Tasa actual: ${rate.toFixed(2)} BOB)`
      : `(Current rate: ${rate.toFixed(2)} BOB)`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border-2 border-blue-200 dark:border-blue-800">
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'es' ? '🔔 Alertas de Tipo de Cambio' : '🔔 Exchange Rate Alerts'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {language === 'es'
            ? 'Recibe notificaciones cuando el tipo de cambio alcance tu objetivo'
            : 'Get notified when the exchange rate reaches your target'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="alert-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'es' ? 'Email' : 'Email'}
          </label>
          <input
            type="email"
            id="alert-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
          />
        </div>

        {/* Alert Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === 'es' ? 'Tipo de Tasa' : 'Rate Type'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAlertType('buy');
                if (currentRate?.buy && !threshold) {
                  setThreshold(currentRate.buy.toFixed(2));
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                alertType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {language === 'es' ? 'Compra' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAlertType('sell');
                if (currentRate?.sell && !threshold) {
                  setThreshold(currentRate.sell.toFixed(2));
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                alertType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {language === 'es' ? 'Venta' : 'Sell'}
            </button>
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {language === 'es' ? 'Notificar cuando' : 'Notify when'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection('above')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                direction === 'above'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {language === 'es' ? '📈 Sube a' : '📈 Rises to'}
            </button>
            <button
              type="button"
              onClick={() => setDirection('below')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                direction === 'below'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {language === 'es' ? '📉 Baja a' : '📉 Drops to'}
            </button>
          </div>
        </div>

        {/* Threshold */}
        <div>
          <label htmlFor="alert-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'es' ? 'Umbral (BOB)' : 'Threshold (BOB)'} {getCurrentRateText()}
          </label>
          <input
            type="number"
            id="alert-threshold"
            step="0.01"
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="8.50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending'
            ? (language === 'es' ? 'Creando alerta...' : 'Creating alert...')
            : (language === 'es' ? 'Crear Alerta' : 'Create Alert')}
        </button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {language === 'es'
              ? '✅ ¡Alerta creada! Te notificaremos cuando el tipo de cambio alcance tu objetivo.'
              : '✅ Alert created! We\'ll notify you when the exchange rate reaches your target.'}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {language === 'es'
              ? '❌ Error al crear la alerta. Por favor, intenta de nuevo.'
              : '❌ Error creating alert. Please try again.'}
          </div>
        )}
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        {language === 'es'
          ? 'Puedes cancelar tu alerta en cualquier momento usando el enlace en el email.'
          : 'You can cancel your alert anytime using the link in the email.'}
      </p>
    </div>
  );
}

export default RateAlertForm;

