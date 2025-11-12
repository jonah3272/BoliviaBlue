import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function DailySentimentHeader() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [dailySentiment, setDailySentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendDetails, setTrendDetails] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('top');
  const badgeRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const loadSentiment = async () => {
      try {
        const allNews = await fetchNews(null, 100);
        
        // Calculate daily sentiment from articles in last 24h
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
          const hoursAgo = (now - publishedDate) / (1000 * 60 * 60); // Hours since publication
          
          // Time-weighting: More recent articles have higher weight
          // Exponential decay: weight = e^(-hoursAgo/12)
          // Articles from last 6 hours get ~60% weight, 12 hours get ~37%, 24 hours get ~14%
          const timeWeight = Math.exp(-hoursAgo / 12);
          
          // Category weighting: Currency-related articles are more important
          const categoryWeight = article.category === 'currency' ? 1.5 : 1.0;
          
          // Combined weight
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
        const neutralCount = dailyArticles.filter(a => a.sentiment === 'neutral').length;
        
        // Determine trend with confidence threshold
        // Need at least 20% difference in weighted scores OR 2+ article difference
        const scoreDiff = Math.abs(upScore - downScore);
        const totalScore = upScore + downScore;
        const confidence = totalScore > 0 ? (scoreDiff / totalScore) * 100 : 0;
        
        // Trend determination: Consider both weighted scores and counts
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

  // Calculate tooltip position to prevent off-screen - MUST be before early return
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
    const viewportWidth = window.innerWidth;

    // Estimate tooltip dimensions (will be adjusted after render)
    const estimatedTooltipHeight = 150;
    const estimatedTooltipWidth = 300;

    // Check if tooltip would go above viewport
    const spaceAbove = badgeRect.top;
    const spaceBelow = viewportHeight - badgeRect.bottom;

    // Determine vertical position
    let verticalPos = 'top';
    if (spaceAbove < estimatedTooltipHeight + 10 && spaceBelow > estimatedTooltipHeight + 10) {
      verticalPos = 'bottom';
    }

    setTooltipPosition(verticalPos);
    setShowTooltip(true);

    // Adjust horizontal position after tooltip renders
    setTimeout(() => {
      if (!tooltipRef.current || !badgeRef.current) return;
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();
      const badgeCenterX = badgeRect.left + badgeRect.width / 2;
      const tooltipHalfWidth = tooltipRect.width / 2;
      let horizontalOffset = 0;
      
      if (badgeCenterX - tooltipHalfWidth < 10) {
        // Too far left, shift right
        horizontalOffset = 10 - (badgeCenterX - tooltipHalfWidth);
      } else if (badgeCenterX + tooltipHalfWidth > viewportWidth - 10) {
        // Too far right, shift left
        horizontalOffset = (viewportWidth - 10) - (badgeCenterX + tooltipHalfWidth);
      }

      if (horizontalOffset !== 0) {
        tooltipRef.current.style.left = `calc(50% + ${horizontalOffset}px)`;
      } else {
        tooltipRef.current.style.left = '50%';
      }
    }, 0);
  }, []);

  // Recalculate position on window resize - MUST be before early return
  useEffect(() => {
    if (showTooltip) {
      const handleResize = () => {
        handleTooltipToggle(true);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showTooltip, handleTooltipToggle]);

  // Early return AFTER all hooks
  if (isLoading || !dailySentiment || !trendDetails || dailySentiment.total === 0) {
    return null;
  }

  // Determine overall trend
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

  // Tooltip text explaining the methodology
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            ref={badgeRef}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${trendBg} shadow-sm relative cursor-help`}
            onMouseEnter={() => handleTooltipToggle(true)}
            onMouseLeave={() => handleTooltipToggle(false)}
          >
            <span className={`text-2xl font-bold ${trendColor}`}>{trendIcon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {t('dailySentimentTitle')}
              </span>
              <span className={`text-sm font-bold ${trendColor} leading-tight`}>
                {trendText}
              </span>
            </div>
            {/* Info Icon */}
            <button
              type="button"
              className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label={language === 'es' ? 'Información sobre el análisis de sentimiento' : 'Information about sentiment analysis'}
              onClick={(e) => {
                e.stopPropagation();
                handleTooltipToggle(!showTooltip);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Tooltip with smart positioning */}
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
                {/* Arrow pointing to badge */}
                <div className={`absolute ${tooltipPosition === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'} left-1/2 transform -translate-x-1/2`}>
                  <div className={`border-4 border-transparent ${tooltipPosition === 'top' ? 'border-t-gray-900 dark:border-t-gray-800' : 'border-b-gray-900 dark:border-b-gray-800'}`}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Timeframe Badge */}
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {language === 'es' ? 'Últimas 24h' : 'Last 24h'}
          </span>
        </div>
      </div>

      {/* Metrics Row - Connected to Articles */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {language === 'es' ? 'Basado en' : 'Based on'}:
        </div>
        
        {/* Total Articles */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {dailySentiment.total}
          </span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {language === 'es' ? 'artículos' : 'articles'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Positive Count */}
        {dailySentiment.up > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <span className="text-base font-bold text-green-700 dark:text-green-300">↗</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-300">
              {dailySentiment.up}
            </span>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {language === 'es' ? 'sube' : 'up'}
            </span>
          </div>
        )}

        {/* Negative Count */}
        {dailySentiment.down > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <span className="text-base font-bold text-red-700 dark:text-red-300">↘</span>
            <span className="text-sm font-bold text-red-700 dark:text-red-300">
              {dailySentiment.down}
            </span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {language === 'es' ? 'baja' : 'down'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailySentimentHeader;
