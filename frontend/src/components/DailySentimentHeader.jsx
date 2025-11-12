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
  const trendColor = isBullish 
    ? 'text-green-600 dark:text-green-400' 
    : isBearish 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-gray-600 dark:text-gray-400';
  const trendIcon = isBullish ? '↗' : isBearish ? '↘' : '○';
  const trendText = isBullish 
    ? t('dailySentimentTrendUp') 
    : isBearish 
    ? t('dailySentimentTrendDown') 
    : t('dailySentimentNeutral');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm px-2">
      {/* Mobile: Compact single line with icons only */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {t('dailySentimentTitle')}:
        </span>
        <span className={`text-base font-bold ${trendColor}`}>{trendIcon}</span>
        <span className="text-gray-500 dark:text-gray-500">•</span>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {dailySentiment.total}
        </span>
        {dailySentiment.up > 0 && (
          <span className={`flex items-center gap-0.5 text-green-700 dark:text-green-300 font-semibold`}>
            <span className="text-sm">↗</span> {dailySentiment.up}
          </span>
        )}
        {dailySentiment.down > 0 && (
          <span className={`flex items-center gap-0.5 text-red-700 dark:text-red-300 font-semibold`}>
            <span className="text-sm">↘</span> {dailySentiment.down}
          </span>
        )}
      </div>

      {/* Desktop: Full layout with labels */}
      <div className="hidden sm:flex items-center gap-3 flex-wrap justify-center">
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {t('dailySentimentTitle')}:
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${trendColor}`}>{trendIcon}</span>
          <span className={`font-semibold ${trendColor}`}>{trendText}</span>
        </div>
        <span className="text-gray-500 dark:text-gray-500">•</span>
        <span className="text-gray-600 dark:text-gray-400">
          {dailySentiment.total} {language === 'es' ? 'artículos' : 'articles'}
        </span>
        {dailySentiment.up > 0 && (
          <span className="flex items-center gap-1 text-green-700 dark:text-green-300 font-medium">
            <span className="font-bold">↗</span> {dailySentiment.up}
          </span>
        )}
        {dailySentiment.down > 0 && (
          <span className="flex items-center gap-1 text-red-700 dark:text-red-300 font-medium">
            <span className="font-bold">↘</span> {dailySentiment.down}
          </span>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-500">
          ({language === 'es' ? 'Últimas 24h' : 'Last 24h'})
        </span>
      </div>
    </div>
  );
}

export default DailySentimentHeader;
