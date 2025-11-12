import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function RotatingNewsCarousel() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [articles, setArticles] = useState([]);
  const [dailySentiment, setDailySentiment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateIntervalRef = useRef(null);

  // Load articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allNews = await fetchNews(null, 100);
        
        if (allNews.length === 0) {
          setArticles([]);
          setDailySentiment({ total: 0, up: 0, down: 0 });
          setIsLoading(false);
          return;
        }
        
        // Filter for articles from the past 24 hours with up or down sentiment
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const filteredArticles = allNews.filter(article => {
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) return false;
          
          const articleDate = new Date(publishedDate);
          if (isNaN(articleDate.getTime())) return false;
          
          const hasMovement = article.sentiment === 'up' || article.sentiment === 'down';
          const isRecent = articleDate >= oneDayAgo;
          
          return hasMovement && isRecent;
        });
        
        // If no articles in last 24h, show articles from last 7 days instead
        let articlesToShow = filteredArticles;
        if (filteredArticles.length === 0) {
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
        }
        
        // Sort by most recent first
        articlesToShow.sort((a, b) => {
          const dateA = new Date(a.published_at || a.published_at_iso);
          const dateB = new Date(b.published_at || b.published_at_iso);
          return dateB - dateA;
        });
        
        // Calculate daily sentiment from ALL articles in last 24h
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
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount
        });
        
        setArticles(articlesToShow);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading rotating articles:', error);
        setError(error.message);
        setIsLoading(false);
        setArticles([]);
        setDailySentiment({ total: 0, up: 0, down: 0 });
      }
    };

    loadArticles();
    const refreshInterval = setInterval(loadArticles, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Auto-rotate every 5 seconds (only when not paused)
  useEffect(() => {
    if (articles.length === 0 || isPaused) {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
        autoRotateIntervalRef.current = null;
      }
      return;
    }
    
    autoRotateIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
        autoRotateIntervalRef.current = null;
      }
    };
  }, [articles.length, isPaused]);

  // Reset index if current article doesn't exist
  useEffect(() => {
    if (articles.length > 0 && (!articles[currentIndex] || currentIndex >= articles.length)) {
      setCurrentIndex(0);
    }
  }, [articles, currentIndex]);

  // Navigation functions - memoized with useCallback
  const goToPrevious = useCallback(() => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  }, [articles.length]);

  const goToNext = useCallback(() => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % articles.length);
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  }, [articles.length]);

  // Memoize current article and derived values - MUST be before early returns
  const currentArticle = useMemo(() => articles[currentIndex], [articles, currentIndex]);
  
  const { sentimentColor, sentimentBg, sentimentIcon } = useMemo(() => {
    if (!currentArticle) return { sentimentColor: '', sentimentBg: '', sentimentIcon: '' };
    return {
      sentimentColor: currentArticle.sentiment === 'up' 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400',
      sentimentBg: currentArticle.sentiment === 'up'
        ? 'bg-green-100 dark:bg-green-900/30'
        : 'bg-red-100 dark:bg-red-900/30',
      sentimentIcon: currentArticle.sentiment === 'up' ? '↗' : '↘'
    };
  }, [currentArticle]);

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (articles.length === 0 && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {language === 'es' 
            ? 'No hay artículos recientes con movimiento de sentimiento.'
            : 'No recent articles with sentiment movement.'}
        </p>
      </div>
    );
  }

  if (!dailySentiment || !currentArticle) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Article Content with Navigation */}
      <div className="relative">
        <a
          href={currentArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Sentiment Indicator */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${sentimentBg} flex items-center justify-center`}>
              <span className={`text-xl font-bold ${sentimentColor}`}>
                {sentimentIcon}
              </span>
            </div>
            
            {/* Article Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
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
                      return language === 'es' ? 'Hace <1h' : '<1h ago';
                    } else if (diffHours < 24) {
                      return language === 'es' 
                        ? `Hace ${diffHours}h` 
                        : `${diffHours}h ago`;
                    } else if (diffDays < 2) {
                      return language === 'es' ? 'Hace 1d' : '1d ago';
                    } else {
                      return language === 'es' 
                        ? `Hace ${diffDays}d` 
                        : `${diffDays}d ago`;
                    }
                  })()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {currentArticle.title}
              </h3>
              {currentArticle.summary && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                  {currentArticle.summary}
                </p>
              )}
            </div>
          </div>
        </a>

        {/* Navigation Controls */}
        {articles.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToPrevious();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={language === 'es' ? 'Artículo anterior' : 'Previous article'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {articles.slice(0, Math.min(articles.length, 8)).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-blue-600 dark:bg-blue-400 w-3'
                        : 'bg-gray-300 dark:bg-gray-600 w-1.5'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-2">
                {currentIndex + 1}/{articles.length}
              </span>
            </div>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNext();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={language === 'es' ? 'Siguiente artículo' : 'Next article'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RotatingNewsCarousel;
