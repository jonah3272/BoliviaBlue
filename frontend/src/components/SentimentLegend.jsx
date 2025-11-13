import { useLanguage } from '../contexts/LanguageContext';

function SentimentLegend({ compact = false }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');

  if (compact) {
    // Compact version for dashboard
    return (
      <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {t('sentimentIndicators')}
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-green-600 dark:text-green-400 font-bold">↗</span>
          <span className="text-green-700 dark:text-green-300 whitespace-nowrap">{t('sentimentUp')}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-red-600 dark:text-red-400 font-bold">↘</span>
          <span className="text-red-700 dark:text-red-300 whitespace-nowrap">{t('sentimentDown')}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-gray-500 dark:text-gray-400">○</span>
          <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('sentimentNeutral')}</span>
        </div>
        <span className="text-gray-400 whitespace-nowrap">(AI)</span>
      </div>
    );
  }

  // Full version for News page
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-gray-700">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('sentimentKeyIndicators')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
          {/* Dollar UP - GREEN */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">↗</span>
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-semibold whitespace-nowrap">
              {t('sentimentUSDRising')}
            </span>
          </div>
          
          {/* Dollar DOWN - RED */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">↘</span>
            <span className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-semibold whitespace-nowrap">
              {t('sentimentUSDFalling')}
            </span>
          </div>
          
          {/* Neutral - GRAY */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
            <span className="text-base sm:text-lg text-gray-500 dark:text-gray-400">○</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold whitespace-nowrap">
              {t('sentimentNeutral')}
            </span>
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
            {t('sentimentAI')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SentimentLegend;

