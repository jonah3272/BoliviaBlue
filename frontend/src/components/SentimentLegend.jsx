import { useLanguage } from '../contexts/LanguageContext';

function SentimentLegend() {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {language === 'es' ? '🔑 Indicadores:' : '🔑 Indicators:'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">↗️</span>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              {language === 'es' ? 'USD ↑' : 'USD Rising'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">↘️</span>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {language === 'es' ? 'USD ↓' : 'USD Falling'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⚪</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {language === 'es' ? 'Neutral' : 'Neutral'}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
            {language === 'es' ? '(IA)' : '(AI)'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SentimentLegend;

