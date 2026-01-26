import { useState, useEffect, memo } from 'react';
import { fetchNews } from '../utils/api';
import { formatTimeAgo, cleanSummary, cleanTitle } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';
import SentimentLegend from './SentimentLegend';
import SentimentIndicator from './SentimentIndicator';

const NewsCard = memo(function NewsCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-2 flex-1 min-w-0">
          {cleanTitle(item.title)}
        </h3>
        <div className="ml-1 sm:ml-2 flex-shrink-0">
          <SentimentIndicator 
            sentiment={item.sentiment} 
            strength={item.sentiment_strength}
            language={language}
            size="sm"
          />
        </div>
      </div>
      
      {item.summary && cleanSummary(item.summary) && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {cleanSummary(item.summary)}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500 dark:text-gray-400">{item.source}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(item.published_at_iso)}</span>
          {item.category && item.category !== 'general' && (
            <span className="px-2.5 py-1 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold shadow-sm">
              {item.category}
            </span>
          )}
        </div>
      </div>
    </a>
  );
});

function NewsFeed() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySentiment, setDailySentiment] = useState(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Show 6 articles on mobile initially, all on desktop
  const initialMobileCount = 6;
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const displayedNews = showAllNews || !isMobile 
    ? news 
    : news.slice(0, initialMobileCount);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const data = await fetchNews();
        setNews(data.slice(0, 20)); // Show top 20 items
        
        // Calculate daily sentiment summary
        const upCount = data.filter(item => item.sentiment === 'up').length;
        const downCount = data.filter(item => item.sentiment === 'down').length;
        const neutralCount = data.filter(item => item.sentiment === 'neutral').length;
        
        setDailySentiment({ up: upCount, down: downCount, neutral: neutralCount, total: data.length });
        setError(null);
      } catch (err) {
        console.error('Error loading news:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Compact Sentiment Legend + Daily Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <SentimentLegend compact={true} />
        
        {dailySentiment && dailySentiment.total > 0 && (
          <div className="inline-flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {t('latestNews')}
            </span>
            {dailySentiment.up > 0 && (
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                {dailySentiment.up} ↗
              </span>
            )}
            {dailySentiment.down > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
                {dailySentiment.down} ↘
              </span>
            )}
            {dailySentiment.neutral > 0 && (
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold">
                {dailySentiment.neutral} ○
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Noticias relevantes
        </h2>
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 animate-pulse min-h-[120px]">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="text-center text-red-500 py-8">
          Error al cargar noticias
        </div>
      )}
      
      {!isLoading && !error && news.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay noticias disponibles
        </div>
      )}
      
      {!isLoading && !error && news.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Render all articles for SEO, but hide some on mobile */}
            {news.map((item, index) => (
              <div
                key={item.id}
                className={!showAllNews && isMobile && index >= initialMobileCount ? 'hidden' : ''}
              >
                <NewsCard item={item} />
              </div>
            ))}
          </div>
          {/* Load More Button - Only show on mobile when there are more articles */}
          {news.length > initialMobileCount && !showAllNews && isMobile && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllNews(true)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {language === 'es' 
                  ? `Ver ${news.length - initialMobileCount} noticias más`
                  : `Load ${news.length - initialMobileCount} more articles`}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

// Memoize NewsFeed to prevent unnecessary re-renders
export default memo(NewsFeed);

