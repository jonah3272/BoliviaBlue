import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function DailySentimentHeader() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [dailySentiment, setDailySentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSentiment = async () => {
      try {
        const allNews = await fetchNews(null, 100);
        
        // Calculate daily sentiment from articles in last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const dailyArticles = allNews.filter(article => {
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) return false;
          const articleDate = new Date(publishedDate);
          return !isNaN(articleDate.getTime()) && articleDate >= oneDayAgo;
        });
        
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading sentiment:', error);
        setIsLoading(false);
      }
    };

    loadSentiment();
    const refreshInterval = setInterval(loadSentiment, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading || !dailySentiment || dailySentiment.total === 0) {
    return null;
  }

  // Determine overall trend
  const isBullish = dailySentiment.up > dailySentiment.down;
  const isBearish = dailySentiment.down > dailySentiment.up;
  const trendBg = isBullish
    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
    : isBearish
    ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
  const trendColor = isBullish 
    ? 'text-green-700 dark:text-green-300' 
    : isBearish 
    ? 'text-red-700 dark:text-red-300' 
    : 'text-gray-700 dark:text-gray-300';
  const trendIcon = isBullish ? '↗' : isBearish ? '↘' : '○';
  const trendText = isBullish 
    ? t('dailySentimentTrendUp') 
    : isBearish 
    ? t('dailySentimentTrendDown') 
    : t('dailySentimentNeutral');

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
      {/* Main Trend Badge - Most Prominent */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${trendBg} shadow-sm`}>
        <span className={`text-2xl font-bold ${trendColor}`}>{trendIcon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {t('dailySentimentTitle')}
          </span>
          <span className={`text-sm font-bold ${trendColor} leading-tight`}>
            {trendText}
          </span>
        </div>
      </div>

      {/* Total Articles Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {dailySentiment.total}
        </span>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {language === 'es' ? 'artículos' : 'articles'}
        </span>
      </div>

      {/* Positive Count Badge */}
      {dailySentiment.up > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 shadow-sm">
          <span className="text-lg font-bold text-green-700 dark:text-green-300">↗</span>
          <span className="text-sm font-bold text-green-700 dark:text-green-300">
            {dailySentiment.up}
          </span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            {language === 'es' ? 'sube' : 'up'}
          </span>
        </div>
      )}

      {/* Negative Count Badge */}
      {dailySentiment.down > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 shadow-sm">
          <span className="text-lg font-bold text-red-700 dark:text-red-300">↘</span>
          <span className="text-sm font-bold text-red-700 dark:text-red-300">
            {dailySentiment.down}
          </span>
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            {language === 'es' ? 'baja' : 'down'}
          </span>
        </div>
      )}

      {/* Timeframe Badge */}
      <div className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {language === 'es' ? 'Últimas 24h' : 'Last 24h'}
        </span>
      </div>
    </div>
  );
}

export default DailySentimentHeader;
