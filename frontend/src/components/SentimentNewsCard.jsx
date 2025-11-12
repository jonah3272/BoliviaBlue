import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { cleanSummary } from '../utils/formatters';

/**
 * Combined Sentiment Analysis + Rotating News Carousel Component
 * Shows sentiment summary at top, rotating articles below
 */
function SentimentNewsCard() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  const [articles, setArticles] = useState([]);
  const [dailySentiment, setDailySentiment] = useState(null);
  const [trendDetails, setTrendDetails] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('top');
  const badgeRef = useRef(null);
  const tooltipRef = useRef(null);
  const autoRotateIntervalRef = useRef(null);

  // Load articles and calculate sentiment
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allNews = await fetchNews(null, 100);
        
        // Filter articles from last 24 hours with up or down sentiment
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
        
        // Smart trend calculation with time-weighted scoring
        const now = new Date();
        let upScore = 0;
        let downScore = 0;
        let currencyUpCount = 0;
        let currencyDownCount = 0;
        
        dailyArticles.forEach(article => {
          const publishedDate = new Date(article.published_at || article.published_at_iso);
          const hoursAgo = (now - publishedDate) / (1000 * 60 * 60);
          const timeWeight = Math.exp(-hoursAgo / 12);
          const categoryWeight = article.category === 'currency' ? 1.5 : 1.0;
          const weight = timeWeight * categoryWeight;
          
          if (article.sentiment === 'up') {
            upScore += weight;
            if (article.category === 'currency') currencyUpCount++;
          } else if (article.sentiment === 'down') {
            downScore += weight;
            if (article.category === 'currency') currencyDownCount++;
          }
        });
        
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        const neutralCount = dailyArticles.filter(a => a.sentiment === 'neutral' || !a.sentiment).length;
        
        // Determine trend
        const scoreDiff = Math.abs(upScore - downScore);
        const totalScore = upScore + downScore;
        const confidence = totalScore > 0 ? (scoreDiff / totalScore) * 100 : 0;
        
        let trend = 'neutral';
        let trendStrength = 'moderate';
        
        if (upScore > downScore && (confidence > 20 || upCount >= downCount + 2)) {
          trend = 'bullish';
          if (confidence > 50 || upCount >= downCount * 1.5) {
            trendStrength = 'strong';
          }
        } else if (downScore > upScore && (confidence > 20 || downCount >= upCount + 2)) {
          trend = 'bearish';
          if (confidence > 50 || downCount >= upCount * 1.5) {
            trendStrength = 'strong';
          }
        }
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount,
          neutral: neutralCount,
          currencyUp: currencyUpCount,
          currencyDown: currencyDownCount
        });
        
        setTrendDetails({
          trend,
          trendStrength,
          confidence: Math.round(confidence),
          upScore: Math.round(upScore * 10) / 10,
          downScore: Math.round(downScore * 10) / 10
        });
        
        setArticles(articlesToShow);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading sentiment and articles:', err);
        setError(err.message);
        setIsLoading(false);
        setArticles([]);
        setDailySentiment({ total: 0, up: 0, down: 0, neutral: 0 });
      }
    };

    loadData();
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Auto-rotate every 5 seconds
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

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    setTimeout(() => setIsPaused(false), 10000);
  }, [articles.length]);

  const goToNext = useCallback(() => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % articles.length);
    setTimeout(() => setIsPaused(false), 10000);
  }, [articles.length]);

  // Calculate tooltip position
  const handleTooltipToggle = useCallback((show) => {
    if (!show) {
      setShowTooltip(false);
      return;
    }

    if (!badgeRef.current) {
      setShowTooltip(true);
      setTooltipPosition('top');
      return;
    }

    const badgeRect = badgeRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceAbove = badgeRect.top;
    const spaceBelow = viewportHeight - badgeRect.bottom;
    const estimatedTooltipHeight = 150;

    let verticalPos = 'top';
    if (spaceAbove < estimatedTooltipHeight + 10 && spaceBelow > estimatedTooltipHeight + 10) {
      verticalPos = 'bottom';
    }

    setTooltipPosition(verticalPos);
    setShowTooltip(true);

    setTimeout(() => {
      if (!tooltipRef.current || !badgeRef.current) return;
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();
      const badgeCenterX = badgeRect.left + badgeRect.width / 2;
      const tooltipHalfWidth = tooltipRect.width / 2;
      const viewportWidth = window.innerWidth;
      let horizontalOffset = 0;
      
      if (badgeCenterX - tooltipHalfWidth < 10) {
        horizontalOffset = 10 - (badgeCenterX - tooltipHalfWidth);
      } else if (badgeCenterX + tooltipHalfWidth > viewportWidth - 10) {
        horizontalOffset = (viewportWidth - 10) - (badgeCenterX + tooltipHalfWidth);
      }

      if (horizontalOffset !== 0) {
        tooltipRef.current.style.left = `calc(50% + ${horizontalOffset}px)`;
      } else {
        tooltipRef.current.style.left = '50%';
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const handleResize = () => {
        handleTooltipToggle(true);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showTooltip, handleTooltipToggle]);

  // Memoize current article and sentiment styling
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

  // Early returns
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
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

  if (!dailySentiment || !trendDetails || dailySentiment.total === 0) {
    return null;
  }

  // Determine overall sentiment styling
  const isBullish = trendDetails.trend === 'bullish';
  const isBearish = trendDetails.trend === 'bearish';
  const isStrong = trendDetails.trendStrength === 'strong';
  
  const trendBg = isBullish
    ? (isStrong ? 'bg-green-200 dark:bg-green-800/40 border-green-400 dark:border-green-600' : 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700')
    : isBearish
    ? (isStrong ? 'bg-red-200 dark:bg-red-800/40 border-red-400 dark:border-red-600' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700')
    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
  const trendColor = isBullish 
    ? 'text-green-700 dark:text-green-300' 
    : isBearish 
    ? 'text-red-700 dark:text-red-300' 
    : 'text-gray-700 dark:text-gray-300';
  const trendIcon = isBullish ? '↗' : isBearish ? '↘' : '○';
  const trendText = isBullish 
    ? (isStrong ? t('dailySentimentTrendUp') + ' ' + (language === 'es' ? '(Fuerte)' : '(Strong)') : t('dailySentimentTrendUp'))
    : isBearish 
    ? (isStrong ? t('dailySentimentTrendDown') + ' ' + (language === 'es' ? '(Fuerte)' : '(Strong)') : t('dailySentimentTrendDown'))
    : t('dailySentimentNeutral');

  const tooltipText = language === 'es'
    ? `Análisis inteligente basado en ${dailySentiment.total} artículos de las últimas 24h. ` +
      `Ponderación temporal: artículos más recientes tienen mayor peso. ` +
      `Artículos de divisas (${dailySentiment.currencyUp + dailySentiment.currencyDown}) tienen 1.5x peso. ` +
      `Confianza: ${trendDetails.confidence}%. ` +
      `Puntuación: ↗ ${trendDetails.upScore} vs ↘ ${trendDetails.downScore}`
    : `Smart analysis based on ${dailySentiment.total} articles from last 24h. ` +
      `Time-weighted: more recent articles have higher weight. ` +
      `Currency articles (${dailySentiment.currencyUp + dailySentiment.currencyDown}) have 1.5x weight. ` +
      `Confidence: ${trendDetails.confidence}%. ` +
      `Score: ↗ ${trendDetails.upScore} vs ↘ ${trendDetails.downScore}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Sentiment Header - Compact */}
      <div className="p-2.5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sentiment Badge */}
          <div 
            ref={badgeRef}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 ${trendBg} shadow-sm relative cursor-help`}
            onMouseEnter={() => handleTooltipToggle(true)}
            onMouseLeave={() => handleTooltipToggle(false)}
          >
            <span className={`text-lg font-bold ${trendColor}`}>{trendIcon}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {t('dailySentimentTitle')}
              </span>
              <span className={`text-xs font-bold ${trendColor} leading-tight`}>
                {trendText}
              </span>
            </div>
            {/* Info Icon */}
            <button
              type="button"
              className="ml-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label={language === 'es' ? 'Información sobre el análisis de sentimiento' : 'Information about sentiment analysis'}
              onClick={(e) => {
                e.stopPropagation();
                handleTooltipToggle(!showTooltip);
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Tooltip */}
            {showTooltip && (
              <div 
                ref={tooltipRef}
                className={`absolute ${tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 max-w-xs text-center whitespace-normal`}
                style={{ minWidth: '280px' }}
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-left">{tooltipText}</span>
                </div>
                <div className={`absolute ${tooltipPosition === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'} left-1/2 transform -translate-x-1/2`}>
                  <div className={`border-4 border-transparent ${tooltipPosition === 'top' ? 'border-t-gray-900 dark:border-t-gray-800' : 'border-b-gray-900 dark:border-b-gray-800'}`}></div>
                </div>
              </div>
            )}
          </div>

          {/* Article Metrics */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {dailySentiment.total}
            </span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'art.' : 'art.'}
            </span>
          </div>

          {/* Positive Count */}
          {dailySentiment.up > 0 && (
            <div className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <span className="text-xs font-bold text-green-700 dark:text-green-300">↗</span>
              <span className="text-xs font-bold text-green-700 dark:text-green-300">
                {dailySentiment.up}
              </span>
            </div>
          )}

          {/* Negative Count */}
          {dailySentiment.down > 0 && (
            <div className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <span className="text-xs font-bold text-red-700 dark:text-red-300">↘</span>
              <span className="text-xs font-bold text-red-700 dark:text-red-300">
                {dailySentiment.down}
              </span>
            </div>
          )}

          {/* Timeframe */}
          <div className="inline-flex items-center px-1.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              24h
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      {articles.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es' 
              ? 'No hay artículos recientes con movimiento de sentimiento.'
              : 'No recent articles with sentiment movement.'}
          </p>
        </div>
      ) : currentArticle ? (
        <>
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
                {currentArticle.summary && cleanSummary(currentArticle.summary) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                    {cleanSummary(currentArticle.summary)}
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
        </>
      ) : null}
    </div>
  );
}

export default SentimentNewsCard;

