import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { cleanSummary, formatTimeAgo } from '../utils/formatters';
import { Link } from 'react-router-dom';

/**
 * Redesigned SentimentNewsCard - Binance/Kalshi-inspired
 * Clean, compact, accessible financial dashboard component
 */
function SentimentNewsCard() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  const [articles, setArticles] = useState([]);
  const [dailySentiment, setDailySentiment] = useState(null);
  const [trendDetails, setTrendDetails] = useState(null);
  const [sentimentHistory, setSentimentHistory] = useState([]); // For sparkline
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
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
        setLastRefresh(new Date());
        
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
        
        // Calculate sentiment history for sparkline (hourly buckets)
        const hourlyBuckets = {};
        for (let i = 23; i >= 0; i--) {
          const bucketTime = new Date(now);
          bucketTime.setHours(bucketTime.getHours() - i, 0, 0, 0);
          hourlyBuckets[bucketTime.getTime()] = { up: 0, down: 0, neutral: 0 };
        }
        
        dailyArticles.forEach(article => {
          const publishedDate = new Date(article.published_at || article.published_at_iso);
          const bucketTime = new Date(publishedDate);
          bucketTime.setMinutes(0, 0, 0);
          const bucketKey = bucketTime.getTime();
          
          if (hourlyBuckets[bucketKey]) {
            if (article.sentiment === 'up') hourlyBuckets[bucketKey].up++;
            else if (article.sentiment === 'down') hourlyBuckets[bucketKey].down++;
            else hourlyBuckets[bucketKey].neutral++;
          }
        });
        
        // Convert to sparkline data points
        const sparklineData = Object.entries(hourlyBuckets)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([timestamp, counts]) => {
            const total = counts.up + counts.down + counts.neutral;
            if (total === 0) return 0;
            const score = ((counts.up - counts.down) / total) * 50;
            return Math.max(-50, Math.min(50, score));
          });
        
        setSentimentHistory(sparklineData);
        
        // Smart trend calculation with time-weighted scoring
        let upScore = 0;
        let downScore = 0;
        
        dailyArticles.forEach(article => {
          const publishedDate = new Date(article.published_at || article.published_at_iso);
          const hoursAgo = (now - publishedDate) / (1000 * 60 * 60);
          const timeWeight = Math.exp(-hoursAgo / 12);
          const categoryWeight = article.category === 'currency' ? 1.5 : 1.0;
          const weight = timeWeight * categoryWeight;
          
          if (article.sentiment === 'up') {
            upScore += weight;
          } else if (article.sentiment === 'down') {
            downScore += weight;
          }
        });
        
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        const neutralCount = dailyArticles.filter(a => a.sentiment === 'neutral' || !a.sentiment).length;
        
        // Calculate sentiment score on a -50 to +50 scale
        const totalScore = upScore + downScore;
        const scoreDiff = upScore - downScore;
        
        let sentimentScore = 0;
        if (totalScore > 0) {
          const normalizedDiff = (scoreDiff / totalScore) * 50;
          sentimentScore = Math.max(-50, Math.min(50, Math.round(normalizedDiff)));
        }
        
        const countDiff = upCount - downCount;
        const totalCount = upCount + downCount;
        if (totalCount > 0) {
          const countBasedScore = (countDiff / totalCount) * 50;
          sentimentScore = Math.round(sentimentScore * 0.7 + countBasedScore * 0.3);
          sentimentScore = Math.max(-50, Math.min(50, sentimentScore));
        }
        
        setDailySentiment({
          total: dailyArticles.length,
          up: upCount,
          down: downCount,
          neutral: neutralCount,
          score: sentimentScore
        });
        
        setTrendDetails({
          score: sentimentScore,
          confidence: totalScore > 0 ? Math.round((Math.abs(scoreDiff) / totalScore) * 100) : 0,
          upScore: Math.round(upScore * 10) / 10,
          downScore: Math.round(downScore * 10) / 10
        });
        
        // Filter articles from last 24 hours with up or down sentiment
        const filteredArticles = allNews.filter(article => {
          const publishedDate = article.published_at || article.published_at_iso;
          if (!publishedDate) return false;
          
          const articleDate = new Date(publishedDate);
          if (isNaN(articleDate.getTime())) return false;
          
          const hasMovement = article.sentiment === 'up' || article.sentiment === 'down';
          const isRecent = articleDate >= oneDayAgo;
          
          return hasMovement && isRecent;
        });
        
        // If no articles in last 24h, show articles from last 7 days
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

  useEffect(() => {
    if (articles.length > 0 && (!articles[currentIndex] || currentIndex >= articles.length)) {
      setCurrentIndex(0);
    }
  }, [articles, currentIndex]);

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

  const handleRefresh = useCallback(() => {
    // Trigger reload
    window.location.reload();
  }, []);

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
      const handleResize = () => handleTooltipToggle(true);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showTooltip, handleTooltipToggle]);

  // Get source domain helper
  const getDomain = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const getFaviconUrl = (source, url) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  // Calculate stale time
  const getStaleTime = useMemo(() => {
    if (!lastRefresh) return null;
    const minutesAgo = Math.floor((new Date() - lastRefresh) / (1000 * 60));
    return minutesAgo > 15 ? minutesAgo : null;
  }, [lastRefresh]);

  // Early returns
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-700/40 bg-[#161a1d] p-4 md:p-5 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 bg-gray-700/50 rounded w-1/4 animate-pulse"></div>
          <div className="h-20 bg-gray-700/50 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-700/40 bg-[#161a1d] p-4 md:p-5 shadow-sm">
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  if (!dailySentiment || !trendDetails) {
    return null;
  }

  const sentimentScore = trendDetails?.score || 0;
  const isPositive = sentimentScore > 0;
  const isNegative = sentimentScore < 0;
  
  // Calculate compass position (0-100%)
  const compassPosition = ((sentimentScore + 50) / 100) * 100;
  
  const tooltipText = language === 'es'
    ? `Análisis basado en ${dailySentiment.total} artículos de las últimas 24h. Ponderación temporal y por categoría aplicada.`
    : `Analysis based on ${dailySentiment.total} articles from last 24h. Time and category weighting applied.`;

  return (
    <div className="rounded-xl border border-gray-700/40 bg-[#161a1d] p-4 md:p-5 shadow-sm">
      {/* Header - Tightened */}
      <div className="space-y-3">
        {/* Top Row: Title + Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            {language === 'es' ? "Sentimiento del día" : "Today's Sentiment"}
          </h2>
          
          {/* Right: Controls Pill */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-600/50 bg-gray-800/30">
            <span className="text-xs text-zinc-500">24h</span>
            <button
              onClick={handleRefresh}
              className="p-0.5 hover:bg-gray-700/50 rounded transition-colors"
              aria-label={language === 'es' ? 'Actualizar' : 'Refresh'}
              tabIndex={0}
            >
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {getStaleTime && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-900/30 text-amber-400 rounded">
                stale {getStaleTime}m
              </span>
            )}
          </div>
        </div>

        {/* Sentiment Gauge */}
        <div className="space-y-1.5">
          {/* Gauge Track */}
          <div className="relative h-8 flex items-center">
            {/* Background gradient */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-900/50 via-gray-700/50 to-emerald-900/50"></div>
            </div>
            
            {/* Tick marks: Only at Neg, 0, Pos */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              {/* Neg tick */}
              <div className="w-0.5 h-3 bg-rose-400 rounded-full"></div>
              {/* Center (0) tick */}
              <div className="w-0.5 h-4 bg-zinc-400 rounded-full"></div>
              {/* Pos tick */}
              <div className="w-0.5 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            
            {/* Indicator needle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white rounded-full transform -translate-x-1/2 transition-all duration-500 z-10 shadow-lg"
              style={{ left: `${compassPosition}%` }}
            >
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
          
          {/* Labels under bar */}
          <div className="flex items-center justify-between px-1 text-[10px] font-medium">
            <span className="text-rose-400">Neg</span>
            <span className="text-zinc-500">Neu</span>
            <span className="text-emerald-400">Pos</span>
          </div>
        </div>

        {/* Sparkline */}
        {sentimentHistory.length > 0 && (
          <div className="h-8 opacity-40 hover:opacity-100 transition-opacity">
            <svg width="100%" height="100%" className="overflow-visible">
              <polyline
                points={sentimentHistory.map((score, i) => {
                  const x = (i / (sentimentHistory.length - 1)) * 100;
                  const y = 100 - ((score + 50) / 100) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={isPositive ? '#34d399' : isNegative ? '#fb7185' : '#a1a1aa'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Badges Row: Score + Counts */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Net Score */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${
            isPositive 
              ? 'bg-emerald-900/30 text-emerald-400'
              : isNegative
              ? 'bg-rose-900/30 text-rose-400'
              : 'bg-gray-800/50 text-zinc-300'
          }`}>
            <span className="text-xs font-bold tabular-nums">
              {sentimentScore > 0 ? '+' : ''}{sentimentScore}
            </span>
            <span className="text-[10px]">
              {isPositive ? '▲' : isNegative ? '▼' : '○'}
            </span>
          </div>
          
          {/* Article Count */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800/50 text-zinc-300">
            <span className="text-xs font-semibold tabular-nums">{dailySentiment.total}</span>
            <span className="text-[10px] text-zinc-500">{language === 'es' ? 'artículos' : 'articles'}</span>
          </div>
          
          {/* Positive Count */}
          {dailySentiment.up > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-900/30 text-emerald-400">
              <span className="text-xs font-semibold">+{dailySentiment.up}</span>
            </div>
          )}
          
          {/* Negative Count */}
          {dailySentiment.down > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-900/30 text-rose-400">
              <span className="text-xs font-semibold">-{dailySentiment.down}</span>
            </div>
          )}
        </div>
      </div>

      {/* Article Card */}
      {articles.length === 0 ? (
        <div className="mt-4 p-4 text-center rounded-lg bg-gray-800/30 border border-gray-700/40">
          <p className="text-sm text-zinc-500">
            {language === 'es' 
              ? 'No hay artículos nuevos en las últimas 24h.'
              : 'No new articles in the last 24h.'}
          </p>
        </div>
      ) : articles[currentIndex] ? (
        <div className="mt-4 space-y-4">
          {/* Article Card */}
          <a
            href={articles[currentIndex].url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg bg-gray-800/30 border border-gray-700/40 hover:bg-gray-800/50 transition-colors group"
            tabIndex={0}
          >
            {/* Row: Favicon, Domain, Time */}
            <div className="flex items-center gap-2 mb-2">
              {getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url) && (
                <img 
                  src={getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url)} 
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span className="text-xs text-zinc-500 font-medium">
                {getDomain(articles[currentIndex].url) || articles[currentIndex].source}
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-500">
                {(() => {
                  const publishedDate = articles[currentIndex].published_at || articles[currentIndex].published_at_iso;
                  if (!publishedDate) return '';
                  const date = new Date(publishedDate);
                  if (isNaN(date.getTime())) return '';
                  const now = new Date();
                  const diffMs = now - date;
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  
                  if (diffHours < 1) {
                    return language === 'es' ? '<1h' : '<1h';
                  } else if (diffHours < 24) {
                    return `${diffHours}h`;
                  } else if (diffDays < 2) {
                    return language === 'es' ? '1d' : '1d';
                  } else {
                    return `${diffDays}d`;
                  }
                })()}
              </span>
            </div>
            
            {/* Title on its own line */}
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 mb-2 group-hover:underline">
              {articles[currentIndex].title}
            </h3>
            
            {/* Right side: Open and Share icons */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                articles[currentIndex].sentiment === 'up'
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : articles[currentIndex].sentiment === 'down'
                  ? 'bg-rose-900/30 text-rose-400'
                  : 'bg-gray-800/50 text-zinc-500'
              }`}>
                <span className="text-xs">
                  {articles[currentIndex].sentiment === 'up' ? '↗' : articles[currentIndex].sentiment === 'down' ? '↘' : '○'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: articles[currentIndex].title,
                      url: articles[currentIndex].url
                    });
                  }
                }}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                aria-label={language === 'es' ? 'Compartir' : 'Share'}
                tabIndex={0}
              >
                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </a>

          {/* Pager: Prev | 1 of 10 | Next + View All */}
          {articles.length > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-700/40">
              {/* Prev | Count | Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToPrevious();
                  }}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={language === 'es' ? 'Anterior' : 'Previous'}
                  tabIndex={0}
                >
                  Prev
                </button>
                <span className="text-xs text-zinc-500">
                  {currentIndex + 1} {language === 'es' ? 'de' : 'of'} {articles.length}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToNext();
                  }}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={language === 'es' ? 'Siguiente' : 'Next'}
                  tabIndex={0}
                >
                  Next
                </button>
              </div>
              
              {/* View All Link */}
              <Link
                to="/news"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                tabIndex={0}
              >
                {language === 'es' ? 'Ver todos' : 'View all'} →
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SentimentNewsCard;
