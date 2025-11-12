import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { cleanSummary } from '../utils/formatters';

/**
 * Binance/Kalshi-inspired News Sentiment Dashboard Component
 * Clean, modern, data-rich card system for tracking sentiment and news
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
  const tooltipRef = useRef(null);
  const infoIconRef = useRef(null);
  const autoRotateIntervalRef = useRef(null);

  // Load articles and calculate sentiment
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allNews = await fetchNews(null, 100);
        
        // Calculate daily sentiment from ALL articles in last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        const now = new Date();
        
        const dailyArticles = allNews.filter(article => {
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) return false;
          const articleDate = new Date(publishedDate);
          return !isNaN(articleDate.getTime()) && articleDate >= oneDayAgo;
        });
        
        // Smart trend calculation with time-weighted scoring
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
        
        // Calculate sentiment score on a -50 to +50 scale (political compass style)
        // Normalize based on weighted scores and article counts
        const totalScore = upScore + downScore;
        const scoreDiff = upScore - downScore;
        
        // Calculate base score from weighted difference
        let sentimentScore = 0;
        if (totalScore > 0) {
          // Normalize to -50 to +50 based on score difference
          const normalizedDiff = (scoreDiff / totalScore) * 50;
          sentimentScore = Math.max(-50, Math.min(50, Math.round(normalizedDiff)));
        }
        
        // Also consider article count difference for more granular scoring
        const countDiff = upCount - downCount;
        const totalCount = upCount + downCount;
        if (totalCount > 0) {
          const countBasedScore = (countDiff / totalCount) * 50;
          // Blend both scores (70% weighted score, 30% count-based)
          sentimentScore = Math.round(sentimentScore * 0.7 + countBasedScore * 0.3);
          sentimentScore = Math.max(-50, Math.min(50, sentimentScore));
        }
        
        // Determine trend label and strength
        let trend = 'neutral';
        let trendStrength = 'moderate';
        
        if (sentimentScore > 10) {
          trend = 'bullish';
          if (sentimentScore > 30) {
            trendStrength = 'strong';
          }
        } else if (sentimentScore < -10) {
          trend = 'bearish';
          if (sentimentScore < -30) {
            trendStrength = 'strong';
          }
        }
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount,
          neutral: neutralCount,
          currencyUp: currencyUpCount,
          currencyDown: currencyDownCount,
          score: sentimentScore // Add score to dailySentiment
        });
        
        setTrendDetails({
          trend,
          trendStrength,
          score: sentimentScore,
          confidence: totalScore > 0 ? Math.round((Math.abs(scoreDiff) / totalScore) * 100) : 0,
          upScore: Math.round(upScore * 10) / 10,
          downScore: Math.round(downScore * 10) / 10
        });
        
        // Filter articles from last 24 hours with up or down sentiment for rotation
        // Reuse oneDayAgo from above (already set to 24 hours ago)
        
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

    setShowTooltip(true);

    setTimeout(() => {
      if (!tooltipRef.current || !infoIconRef.current) return;
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const infoIconRect = infoIconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let leftPos = infoIconRect.right + 10;
      let topPos = infoIconRect.top + (infoIconRect.height / 2) - (tooltipRect.height / 2);
      
      if (leftPos + tooltipRect.width > viewportWidth - 10) {
        leftPos = infoIconRect.left - tooltipRect.width - 10;
      }
      
      if (topPos < 10) {
        topPos = 10;
      } else if (topPos + tooltipRect.height > viewportHeight - 10) {
        topPos = viewportHeight - tooltipRect.height - 10;
      }
      
      tooltipRef.current.style.left = `${leftPos}px`;
      tooltipRef.current.style.top = `${topPos}px`;
      tooltipRef.current.style.transform = 'none';
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

  // Early returns
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
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

  if (!dailySentiment || !trendDetails) {
    return null;
  }

  // Get sentiment score (-50 to +50)
  const sentimentScore = trendDetails?.score || 0;
  const isPositive = sentimentScore > 0;
  const isNegative = sentimentScore < 0;
  const isNeutral = sentimentScore === 0;
  
  // Dynamic zoom: Calculate visible range based on score magnitude
  // If score is small, zoom in. If large, show full range.
  const scoreMagnitude = Math.abs(sentimentScore);
  let minRange, maxRange, visibleRange;
  
  if (scoreMagnitude <= 5) {
    // Very small score: zoom in to ±10 range
    minRange = -10;
    maxRange = 10;
    visibleRange = 20;
  } else if (scoreMagnitude <= 15) {
    // Small score: zoom in to ±25 range
    minRange = -25;
    maxRange = 25;
    visibleRange = 50;
  } else if (scoreMagnitude <= 30) {
    // Medium score: show ±40 range
    minRange = -40;
    maxRange = 40;
    visibleRange = 80;
  } else {
    // Large score: show full ±50 range
    minRange = -50;
    maxRange = 50;
    visibleRange = 100;
  }
  
  // Calculate position on compass within the visible range
  // Use actual score (not clamped) for precise positioning, but clamp for visual bounds
  // Convert score to percentage: (score - minRange) / visibleRange * 100
  // Ensure it stays within 0-100% bounds
  const rawPosition = ((sentimentScore - minRange) / visibleRange) * 100;
  const compassPosition = Math.max(0, Math.min(100, rawPosition));
  
  // Determine colors based on score
  const getScoreColor = () => {
    if (isPositive) {
      if (sentimentScore > 30) return 'text-green-600 dark:text-green-400';
      return 'text-green-500 dark:text-green-500';
    } else if (isNegative) {
      if (sentimentScore < -30) return 'text-red-600 dark:text-red-400';
      return 'text-red-500 dark:text-red-500';
    }
    return 'text-gray-500 dark:text-gray-400';
  };
  
  const scoreColor = getScoreColor();

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

  // Get source favicon URL helper
  const getFaviconUrl = (source, url) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121416] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Top Bar - Sentiment Summary */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Sentiment Label & Compass */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('dailySentimentTitle')}
              </span>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {language === 'es' 
                  ? 'Actualizado cada hora desde fuentes principales de noticias bolivianas.'
                  : 'Updated hourly from major Bolivian news sources.'}
              </p>
            </div>
            
            {/* Sentiment Compass Gauge - Dynamic Zoom with Labels */}
            <div className="flex items-center gap-2">
              {/* Compact Compass Indicator */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800/50">
                {/* Compass Track with Labels */}
                <div className="relative w-40 flex flex-col items-center">
                  {/* Track Container */}
                  <div className="relative w-full h-7 flex items-center overflow-visible hover:bg-[#1C1F22] transition-colors rounded-full">
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    
                    {/* Center line (neutral point) - subtle */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gray-300 dark:bg-gray-600 z-10"></div>
                    
                    {/* Sub-tick marks: Show scale divisions based on visible range */}
                    {(() => {
                      // Calculate tick interval based on visible range
                      // For smaller ranges, show ticks every 2-5 points. For larger ranges, every 5-10 points.
                      let tickInterval;
                      if (visibleRange <= 20) {
                        tickInterval = 2; // Every 2 points for ±10 range
                      } else if (visibleRange <= 50) {
                        tickInterval = 5; // Every 5 points for ±25 range
                      } else if (visibleRange <= 80) {
                        tickInterval = 10; // Every 10 points for ±40 range
                      } else {
                        tickInterval = 10; // Every 10 points for ±50 range
                      }
                      
                      // Generate tick marks
                      const ticks = [];
                      for (let value = minRange; value <= maxRange; value += tickInterval) {
                        // Skip center (0) as it's already marked
                        if (value === 0) continue;
                        
                        // Calculate position percentage
                        const tickPosition = ((value - minRange) / visibleRange) * 100;
                        
                        ticks.push(
                          <div
                            key={value}
                            className="absolute w-px h-2 bg-gray-400 dark:bg-gray-500 rounded-full transform -translate-x-1/2"
                            style={{ left: `${tickPosition}%` }}
                          ></div>
                        );
                      }
                      return ticks;
                    })()}
                    
                    {/* Major range markers: Left, Center, Right */}
                    <div className="absolute inset-0 flex items-center justify-between px-0.5">
                      <div className="w-0.5 h-3 bg-gray-500 dark:bg-gray-400 rounded-full z-10"></div>
                      <div className="w-0.5 h-3 bg-gray-500 dark:bg-gray-400 rounded-full z-10"></div>
                      <div className="w-0.5 h-3 bg-gray-500 dark:bg-gray-400 rounded-full z-10"></div>
                    </div>
                    
                    {/* Indicator: Vertical line with downward arrow - More prominent */}
                    <div 
                      className="absolute top-0 bottom-0 flex flex-col items-center transform -translate-x-1/2 transition-all duration-500 ease-out z-30"
                      style={{ left: `${compassPosition}%` }}
                    >
                      {/* Vertical indicator line - thicker and more visible with glow */}
                      <div 
                        className={`w-1.5 h-full ${
                          isPositive 
                            ? 'bg-green-600 dark:bg-green-400' 
                            : isNegative 
                            ? 'bg-red-600 dark:bg-red-400'
                            : 'bg-gray-600 dark:bg-gray-400'
                        } rounded-full shadow-md ${
                          isNegative 
                            ? 'shadow-[0_0_6px_rgba(255,77,77,0.5)]' 
                            : isPositive
                            ? 'shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                            : ''
                        }`}
                      ></div>
                      {/* Downward arrow - positioned within track bounds */}
                      <div 
                        className={`absolute bottom-0 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${
                          isPositive 
                            ? 'border-t-green-600 dark:border-t-green-400' 
                            : isNegative 
                            ? 'border-t-red-600 dark:border-t-red-400'
                            : 'border-t-gray-600 dark:border-t-gray-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Labels: Negative (left) and Positive (right) - tighter spacing */}
                  <div className="absolute top-full left-0 right-0 flex items-center justify-between pt-0.5 px-0.5 text-[9px] font-medium">
                    <span className="text-red-600 dark:text-red-400">
                      {language === 'es' ? 'Neg' : 'Neg'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {language === 'es' ? 'Neu' : 'Neu'}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {language === 'es' ? 'Pos' : 'Pos'}
                    </span>
                  </div>
                </div>
                
                {/* Score Display */}
                <div className={`flex items-center transition-all duration-200 ${
                  isPositive 
                    ? 'text-emerald-400' 
                    : isNegative 
                    ? 'text-rose-400'
                    : 'text-gray-400'
                }`}>
                  <span className="text-sm font-bold tabular-nums min-w-[2.5rem] text-right">
                    {sentimentScore > 0 ? '+' : ''}{sentimentScore}
                  </span>
                </div>
              </div>

              {/* Positive Count Pill */}
              {dailySentiment.up > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-900/30 border border-emerald-800 transition-all duration-200">
                  <span className="text-xs font-bold text-emerald-400">↗</span>
                  <span className="text-xs font-semibold text-emerald-400">{dailySentiment.up}</span>
                </div>
              )}

              {/* Negative Count Pill */}
              {dailySentiment.down > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-900/30 border border-rose-800 transition-all duration-200">
                  <span className="text-xs font-bold text-rose-400">↘</span>
                  <span className="text-xs font-semibold text-rose-400">{dailySentiment.down}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Article Count & Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{dailySentiment.total}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'artículos' : 'articles'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>24h</span>
            </div>

            {/* Info Icon */}
            <button
              ref={infoIconRef}
              type="button"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              aria-label={language === 'es' ? 'Información sobre el análisis de sentimiento' : 'Information about sentiment analysis'}
              onMouseEnter={() => handleTooltipToggle(true)}
              onMouseLeave={() => handleTooltipToggle(false)}
              onClick={(e) => {
                e.stopPropagation();
                handleTooltipToggle(!showTooltip);
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* Tooltip */}
              {showTooltip && (
                <div 
                  ref={tooltipRef}
                  className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 max-w-xs whitespace-normal"
                  style={{ minWidth: '280px' }}
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-left">{tooltipText}</span>
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full">
                    <div className="border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rotating Article Content */}
      {articles.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es' 
              ? 'No hay artículos recientes con movimiento de sentimiento.'
              : 'No recent articles with sentiment movement.'}
          </p>
        </div>
      ) : articles[currentIndex] ? (
        <>
          <a
            href={articles[currentIndex].url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group"
          >
            <div className="flex items-start gap-3">
              {/* Favicon */}
              <div className="flex-shrink-0 mt-0.5">
                {getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url) ? (
                  <img 
                    src={getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url)} 
                    alt={articles[currentIndex].source}
                    className="w-4 h-4 rounded-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>

              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {articles[currentIndex].source}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    • {(() => {
                      const publishedDate = articles[currentIndex].published_at || articles[currentIndex].published_at_iso;
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {articles[currentIndex].title}
                </h3>
                {articles[currentIndex].summary && cleanSummary(articles[currentIndex].summary) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug mt-1">
                    {cleanSummary(articles[currentIndex].summary)}
                  </p>
                )}
              </div>

              {/* Sentiment Indicator */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  articles[currentIndex].sentiment === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : articles[currentIndex].sentiment === 'down'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-gray-100 dark:bg-gray-700/50'
                }`}>
                  <span className={`text-xl font-bold ${
                    articles[currentIndex].sentiment === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : articles[currentIndex].sentiment === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {articles[currentIndex].sentiment === 'up' ? '↗' : articles[currentIndex].sentiment === 'down' ? '↘' : '○'}
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Navigation Controls */}
          {articles.length > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
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
