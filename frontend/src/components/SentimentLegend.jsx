import { useLanguage } from '../contexts/LanguageContext';

function SentimentLegend({ compact = false }) {
  const { language } = useLanguage();

  if (compact) {
    // Compact version for dashboard
    return (
      <div className="inline-flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-400">
          {language === 'es' ? 'Indicadores:' : 'Indicators:'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-green-600 dark:text-green-400 font-bold">↗</span>
          <span className="text-green-700 dark:text-green-300">{language === 'es' ? 'USD↑' : 'Up'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-600 dark:text-red-400 font-bold">↘</span>
          <span className="text-red-700 dark:text-red-300">{language === 'es' ? 'USD↓' : 'Down'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 dark:text-gray-400">○</span>
          <span className="text-gray-600 dark:text-gray-300">{language === 'es' ? 'Neutral' : 'Neutral'}</span>
        </div>
        <span className="text-gray-400">(AI)</span>
      </div>
    );
  }

  // Full version for News page
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {language === 'es' ? '🔑 Indicadores:' : '🔑 Indicators:'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Dollar UP - GREEN */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">↗</span>
            <span className="text-sm text-green-700 dark:text-green-300 font-semibold">
              {language === 'es' ? 'USD ↑' : 'USD Rising'}
            </span>
          </div>
          
          {/* Dollar DOWN - RED */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">↘</span>
            <span className="text-sm text-red-700 dark:text-red-300 font-semibold">
              {language === 'es' ? 'USD ↓' : 'USD Falling'}
            </span>
          </div>
          
          {/* Neutral - GRAY */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
            <span className="text-lg text-gray-500 dark:text-gray-400">○</span>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
              {language === 'es' ? 'Neutral' : 'Neutral'}
            </span>
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">
            {language === 'es' ? '(IA)' : '(AI)'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SentimentLegend;

