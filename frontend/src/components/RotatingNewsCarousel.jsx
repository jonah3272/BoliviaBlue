import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function DailySentimentSummary({ sentiment }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  if (!sentiment || sentiment.total === 0) {
    return null;
  }

  // Determine overall trend
  const isBullish = sentiment.up > sentiment.down;
  const isBearish = sentiment.down > sentiment.up;
  const isNeutral = sentiment.up === sentiment.down;

  const trendColor = isBullish 
    ? 'text-green-600 dark:text-green-400' 
    : isBearish 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-gray-600 dark:text-gray-400';
  
  const trendBg = isBullish
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : isBearish
    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';

  const trendIcon = isBullish ? '↗' : isBearish ? '↘' : '○';
  const trendText = isBullish 
    ? t('dailySentimentTrendUp') 
    : isBearish 
    ? t('dailySentimentTrendDown') 
    : t('dailySentimentNeutral');

  return (
    <div className={`rounded-lg border-2 p-4 ${trendBg} transition-all hover:shadow-md`}>
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
        {t('dailySentimentTitle')}
      </div>
      
      {/* Overall Trend */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-2xl font-bold ${trendColor}`}>
          {trendIcon}
        </span>
        <span className={`text-sm font-semibold ${trendColor}`}>
          {trendText}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {t('dailySentimentTotal')}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {sentiment.total} {t('dailySentimentArticles')}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
            <span className="font-bold">↗</span> {t('dailySentimentPositive')}
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            {sentiment.up}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
            <span className="font-bold">↘</span> {t('dailySentimentNegative')}
          </span>
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            {sentiment.down}
          </span>
        </div>
      </div>
    </div>
  );
}

function RotatingNewsCarousel() {
  console.log('🎬 RotatingNewsCarousel component mounted');
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [articles, setArticles] = useState([]);
  const [dailySentiment, setDailySentiment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('🎬 Component state:', { isLoading, articlesCount: articles.length, hasDailySentiment: !!dailySentiment, error });

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all news from Supabase
        console.log('🔍 Fetching news from Supabase...');
        const allNews = await fetchNews(null, 100);
        console.log(`✅ Fetched ${allNews.length} total articles from Supabase`);
        
        if (allNews.length === 0) {
          console.warn('⚠️ No articles found in Supabase');
          setArticles([]);
          setDailySentiment({ total: 0, up: 0, down: 0 });
          setIsLoading(false);
          return;
        }
        
        // Filter for articles from the past 24 hours with up or down sentiment
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        console.log(`📅 Filtering articles from last 24 hours (since ${oneDayAgo.toISOString()})`);
        
        const filteredArticles = allNews.filter(article => {
          // Handle both published_at and published_at_iso formats
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) {
            console.warn('⚠️ Article missing published_at:', article.id, article.title);
            return false;
          }
          
          const articleDate = new Date(publishedDate);
          if (isNaN(articleDate.getTime())) {
            console.warn('⚠️ Invalid date for article:', article.id, publishedDate);
            return false;
          }
          
          const hasMovement = article.sentiment === 'up' || article.sentiment === 'down';
          const isRecent = articleDate >= oneDayAgo;
          
          if (!hasMovement) {
            console.log(`⏭️ Skipping article (neutral sentiment): ${article.title.substring(0, 50)}`);
          } else if (!isRecent) {
            console.log(`⏭️ Skipping article (too old): ${article.title.substring(0, 50)} (${articleDate.toISOString()})`);
          }
          
          return hasMovement && isRecent;
        });
        
        console.log(`✅ Filtered to ${filteredArticles.length} articles with movement in last 24h`);
        
        // If no articles in last 24h, show articles from last 7 days instead
        let articlesToShow = filteredArticles;
        if (filteredArticles.length === 0) {
          console.log('📅 No articles in last 24h, expanding to last 7 days...');
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          articlesToShow = allNews.filter(article => {
            const publishedDate = article.published_at || article.published_at_iso;
            if (!publishedDate) return false;
            
            const articleDate = new Date(publishedDate);
            if (isNaN(articleDate.getTime())) return false;
            
            const hasMovement = article.sentiment === 'up' || article.sentiment === 'down';
            const isRecent = articleDate >= sevenDaysAgo;
            return hasMovement && isRecent;
          });
          
          console.log(`✅ Found ${articlesToShow.length} articles with movement in last 7 days`);
        }
        
        // Sort by most recent first
        articlesToShow.sort((a, b) => {
          const dateA = new Date(a.published_at || a.published_at_iso);
          const dateB = new Date(b.published_at || b.published_at_iso);
          return dateB - dateA;
        });
        
        // Calculate daily sentiment from ALL articles in last 24h (not just filtered)
        const oneDayAgoForSentiment = new Date();
        oneDayAgoForSentiment.setHours(oneDayAgoForSentiment.getHours() - 24);
        
        const dailyArticles = allNews.filter(article => {
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) return false;
          const articleDate = new Date(publishedDate);
          return !isNaN(articleDate.getTime()) && articleDate >= oneDayAgoForSentiment;
        });
        
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        
        console.log(`📊 Daily sentiment: ${dailyArticles.length} total, ${upCount} up, ${downCount} down`);
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount
        });
        
        setArticles(articlesToShow);
        setIsLoading(false);
        console.log(`✅ Component loaded with ${articlesToShow.length} articles to display`);
      } catch (error) {
        console.error('❌ Error loading rotating articles:', error);
        setError(error.message);
        setIsLoading(false);
        // Set empty state on error
        setArticles([]);
        setDailySentiment({ total: 0, up: 0, down: 0 });
      }
    };

    loadArticles();
    const refreshInterval = setInterval(loadArticles, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (articles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [articles.length]);

  console.log('🎨 Rendering component:', { isLoading, articlesCount: articles.length, hasDailySentiment: !!dailySentiment, error });
  
  if (isLoading) {
    console.log('⏳ Rendering loading state');
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">
              {t('dailySentimentTitle')}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400">
              {language === 'es' 
                ? 'Error al cargar datos'
                : 'Error loading data'}
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
            <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state - ALWAYS show something, never return null
  if (articles.length === 0 && !isLoading) {
    console.log('📭 Rendering empty state');
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          {dailySentiment && dailySentiment.total > 0 ? (
            <DailySentimentSummary sentiment={dailySentiment} />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {t('dailySentimentTitle')}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' 
                  ? 'No hay artículos con movimiento en las últimas 24 horas'
                  : 'No articles with movement in the last 24 hours'}
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
              {language === 'es' 
                ? 'No hay artículos recientes con movimiento de sentimiento. Los artículos se actualizan cada 15 minutos.'
                : 'No recent articles with sentiment movement. Articles update every 15 minutes.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dailySentiment) {
    // Still loading, show loading state
    console.log('⏳ Still loading daily sentiment');
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    console.warn('⚠️ No articles available, showing empty state');
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          {dailySentiment && dailySentiment.total > 0 ? (
            <DailySentimentSummary sentiment={dailySentiment} />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {t('dailySentimentTitle')}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' 
                  ? 'No hay artículos disponibles'
                  : 'No articles available'}
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
              {language === 'es' 
                ? 'No hay artículos disponibles'
                : 'No articles available'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Reset index if current article doesn't exist
  useEffect(() => {
    if (articles.length > 0 && (!articles[currentIndex] || currentIndex >= articles.length)) {
      console.warn('⚠️ Current article index out of bounds, resetting to 0');
      setCurrentIndex(0);
    }
  }, [articles, currentIndex]);

  const currentArticle = articles[currentIndex];
  if (!currentArticle && articles.length > 0) {
    // If we have articles but current one is invalid, show first one
    const firstArticle = articles[0];
    if (firstArticle) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            {dailySentiment && dailySentiment.total > 0 ? (
              <DailySentimentSummary sentiment={dailySentiment} />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">Loading article...</p>
            </div>
          </div>
        </div>
      );
    }
  }
  
  console.log('📰 Rendering article carousel:', { currentIndex, totalArticles: articles.length, articleTitle: currentArticle?.title });
  
  const sentimentColor = currentArticle.sentiment === 'up' 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  const sentimentBg = currentArticle.sentiment === 'up'
    ? 'bg-green-100 dark:bg-green-900/30'
    : 'bg-red-100 dark:bg-red-900/30';
  const sentimentIcon = currentArticle.sentiment === 'up' ? '↗' : '↘';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily Sentiment Summary - Left Side */}
      <div className="lg:col-span-1">
        <DailySentimentSummary sentiment={dailySentiment} />
      </div>

      {/* Rotating Carousel - Right Side */}
      <div className="lg:col-span-2">
        <a
          href={currentArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-3">
            {/* Sentiment Indicator */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${sentimentBg} flex items-center justify-center`}>
              <span className={`text-xl font-bold ${sentimentColor}`}>
                {sentimentIcon}
              </span>
            </div>
            
            {/* Article Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {currentArticle.source}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  • {(() => {
                    const publishedDate = currentArticle.published_at || currentArticle.published_at_iso;
                    if (!publishedDate) return '';
                    
                    const date = new Date(publishedDate);
                    if (isNaN(date.getTime())) return '';
                    
                    const now = new Date();
                    const diffMs = now - date;
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffHours < 1) {
                      return language === 'es' ? 'Hace menos de 1 hora' : 'Less than 1 hour ago';
                    } else if (diffHours < 24) {
                      return language === 'es' 
                        ? `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}` 
                        : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    } else if (diffDays < 2) {
                      return language === 'es' ? 'Hace 1 día' : '1 day ago';
                    } else {
                      return language === 'es' 
                        ? `Hace ${diffDays} días` 
                        : `${diffDays} days ago`;
                    }
                  })()}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {currentArticle.title}
              </h3>
              {currentArticle.summary && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                  {currentArticle.summary}
                </p>
              )}
            </div>
            
            {/* Arrow Icon */}
            <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Progress Indicator */}
          {articles.length > 1 && (
            <div className="flex gap-1 mt-3 justify-center">
              {articles.slice(0, Math.min(articles.length, 5)).map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-blue-600 dark:bg-blue-400 w-6'
                      : 'bg-gray-300 dark:bg-gray-600 w-1'
                  }`}
                />
              ))}
            </div>
          )}
        </a>
      </div>
    </div>
  );
}

export default RotatingNewsCarousel;
