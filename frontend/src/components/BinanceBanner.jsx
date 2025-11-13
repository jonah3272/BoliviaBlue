import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { BINANCE_REFERRAL_LINK } from '../config/referrals';

function BinanceBanner() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-blue-500"></div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left side - Illustration */}
          <div className="flex-shrink-0">
            <svg className="w-24 h-24 md:w-32 md:h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Coin illustration */}
              <circle cx="100" cy="100" r="80" fill="#F59E0B" opacity="0.2"/>
              <circle cx="100" cy="100" r="65" fill="#F59E0B" opacity="0.3"/>
              <circle cx="100" cy="100" r="50" fill="#F59E0B"/>
              <text x="100" y="115" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle">$</text>
              {/* Arrows indicating exchange */}
              <path d="M160 80 L180 80 L170 70 M180 80 L170 90 Z" stroke="#10B981" strokeWidth="3" fill="#10B981"/>
              <path d="M40 120 L20 120 L30 130 M20 120 L30 110 Z" stroke="#3B82F6" strokeWidth="3" fill="#3B82F6"/>
            </svg>
          </div>
          
          {/* Center - Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? 'Compra Dólares en Binance' : 'Buy Dollars on Binance'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {language === 'es' 
                ? 'La forma más segura y rápida de comprar dólares con la mejor tasa del mercado.'
                : 'The safest and fastest way to buy dollars with the best market rate.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {language === 'es' ? 'Seguro' : 'Secure'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {language === 'es' ? 'Rápido' : 'Fast'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {language === 'es' ? 'Mejor Tasa' : 'Best Rate'}
              </span>
            </div>
          </div>
          
          {/* Right side - CTA Buttons */}
          <div className="flex-shrink-0 flex gap-3">
            <Link
              to="/buy-dollars"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              {language === 'es' ? 'Más info' : 'Learn more'}
            </Link>
            <a
              href={BINANCE_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('goToBinanceAria')}
              className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {language === 'es' ? 'Ir a Binance' : 'Go to Binance'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BinanceBanner;

