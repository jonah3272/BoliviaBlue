import { useLanguage } from '../contexts/LanguageContext';

function BinanceBanner() {
  const { t } = useLanguage();
  
  const referralLink = "https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default";
  
  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Left side - Content */}
          <div className="flex items-center gap-4">
            {/* Binance Logo */}
            <div className="flex-shrink-0 bg-gray-900 dark:bg-white p-2.5 rounded-lg">
              <svg className="w-6 h-6 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24" aria-label="Binance logo">
                <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"/>
              </svg>
            </div>
            
            {/* Text */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('buyDollarsBinance')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t('binanceDescription')}
              </p>
            </div>
          </div>
          
          {/* Right side - CTA Button */}
          <div className="flex-shrink-0">
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('goToBinanceAria')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <span className="text-sm">
                {t('goToBinance')}
              </span>
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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

