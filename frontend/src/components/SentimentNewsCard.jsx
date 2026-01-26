import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchNews, fetchBlueRate } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { cleanSummary, cleanTitle } from '../utils/formatters';
import SentimentIndicator from './SentimentIndicator';

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
  const [currentRate, setCurrentRate] = useState(null);
  const [copied, setCopied] = useState(false);

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
        
        // Smart trend calculation with strength-weighted scoring
        // Uses sentiment_strength (0-100) from each article to properly weight impact
        let upScore = 0;
        let downScore = 0;
        let currencyUpCount = 0;
        let currencyDownCount = 0;
        
        dailyArticles.forEach(article => {
          const publishedDate = new Date(article.published_at || article.published_at_iso);
          const hoursAgo = (now - publishedDate) / (1000 * 60 * 60);
          const timeWeight = Math.exp(-hoursAgo / 12); // Recent articles weighted more
          const categoryWeight = article.category === 'currency' ? 1.5 : 1.0;
          
          // Get sentiment strength (0-100) from article, default to 50 if not available (backward compatibility)
          const sentimentStrength = article.sentiment_strength !== null && article.sentiment_strength !== undefined
            ? Math.max(0, Math.min(100, article.sentiment_strength))
            : 50; // Default moderate strength for articles without strength data
          
          // Calculate weight: time * category * strength (normalized to 0-1)
          // This ensures articles are weighted by how impactful they are, not just counted
          const strengthWeight = sentimentStrength / 100; // Convert 0-100 to 0-1
          const weight = timeWeight * categoryWeight * strengthWeight;
          
          if (article.sentiment === 'up') {
            upScore += weight * strengthWeight; // Multiply by strength again to emphasize impact
            if (article.category === 'currency') currencyUpCount++;
          } else if (article.sentiment === 'down') {
            downScore += weight * strengthWeight;
            if (article.category === 'currency') currencyDownCount++;
          }
        });
        
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        const neutralCount = dailyArticles.filter(a => a.sentiment === 'neutral' || !a.sentiment).length;
        
        // Calculate sentiment score on a -50 to +50 scale
        // PRIMARY: Base score on weighted sentiment intensity (upScore/downScore)
        const totalScore = upScore + downScore;
        const scoreDiff = upScore - downScore;
        
        // Calculate base score from weighted sentiment intensity
        let rawSentimentScore = 0;
        if (totalScore > 0) {
          // Normalize to -50 to +50 based on sentiment intensity difference
          const normalizedDiff = (scoreDiff / totalScore) * 50;
          rawSentimentScore = Math.max(-50, Math.min(50, normalizedDiff));
        }
        
        // CRITICAL: Cap score based on number of articles to prevent 2 articles from reaching +50
        // Maximum possible score scales with number of articles:
        // - 1 article: max ±20
        // - 2 articles: max ±30
        // - 3 articles: max ±35
        // - 4 articles: max ±40
        // - 5+ articles: max ±50 (full range)
        const totalCount = upCount + downCount;
        let maxPossibleScore = 50; // Default for 5+ articles
        
        if (totalCount === 1) {
          maxPossibleScore = 20; // 1 article can't exceed ±20
        } else if (totalCount === 2) {
          maxPossibleScore = 30; // 2 articles can't exceed ±30
        } else if (totalCount === 3) {
          maxPossibleScore = 35; // 3 articles can't exceed ±35
        } else if (totalCount === 4) {
          maxPossibleScore = 40; // 4 articles can't exceed ±40
        }
        
        // Apply the cap
        rawSentimentScore = Math.max(-maxPossibleScore, Math.min(maxPossibleScore, rawSentimentScore));
        
        // Additional dampening for very few articles to ensure smooth scaling
        // This provides extra protection against extreme scores from 1-2 articles
        if (totalCount <= 2) {
          // For 1-2 articles, apply additional dampening factor
          const articleCountDampening = totalCount === 1 ? 0.6 : 0.75; // 1 article = 60%, 2 articles = 75%
          rawSentimentScore = rawSentimentScore * articleCountDampening;
        }
        
        // Confidence-weighted scoring: Dampen scores when sample size is small
        // Sample size confidence: reaches full confidence (1.0) at 30+ articles
        // Uses exponential approach for smoother scaling: 1 - e^(-n/15)
        const sampleSizeConfidence = Math.min(1, 1 - Math.exp(-dailyArticles.length / 15));
        
        // Apply confidence weighting to the raw score based on sample size
        const sentimentScore = Math.round(rawSentimentScore * sampleSizeConfidence);
        
        // Calculate confidence percentage for display (based on sample size)
        const confidencePercentage = Math.round(sampleSizeConfidence * 100);
        
        // Determine trend label and strength based on adjusted score
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
          confidence: confidencePercentage, // Show sample size confidence as percentage
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

  // Load current rate for sharing
  useEffect(() => {
    const loadCurrentRate = async () => {
      try {
        const data = await fetchBlueRate();
        if (data && data.buy && data.sell) {
          setCurrentRate(data);
        }
      } catch (error) {
        console.error('Error loading current rate:', error);
      }
    };
    loadCurrentRate();
    const interval = setInterval(loadCurrentRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Share functions
  const getShareUrl = () => {
    return typeof window !== 'undefined' 
      ? window.location.href.replace(/^https?:\/\/(www\.)?/, 'https://')
      : 'https://boliviablue.com';
  };

  const getShareText = () => {
    const url = getShareUrl();
    
    // Build rate info
    let rateInfo = '';
    if (currentRate && currentRate.buy && currentRate.sell) {
      const buyRate = currentRate.buy.toFixed(2);
      const sellRate = currentRate.sell.toFixed(2);
      rateInfo = language === 'es'
        ? `💰 Tasa Blue: Compra ${buyRate} BOB | Venta ${sellRate} BOB`
        : `💰 Blue Rate: Buy ${buyRate} BOB | Sell ${sellRate} BOB`;
    } else {
      rateInfo = language === 'es'
        ? '💰 Bolivia Blue Rate - Tipo de Cambio en Tiempo Real'
        : '💰 Bolivia Blue Rate - Real-Time Exchange Rate';
    }
    
    // Build sentiment info
    let sentimentInfo = '';
    if (trendDetails && dailySentiment) {
      const score = trendDetails.score || 0;
      const trend = trendDetails.trend || 'neutral';
      const trendStrength = trendDetails.trendStrength || 'moderate';
      
      let sentimentEmoji = '➡️';
      let sentimentText = '';
      
      if (trend === 'bullish') {
        sentimentEmoji = '↗️';
        sentimentText = language === 'es' 
          ? (trendStrength === 'strong' ? 'Alcista Fuerte' : 'Alcista')
          : (trendStrength === 'strong' ? 'Strong Bullish' : 'Bullish');
      } else if (trend === 'bearish') {
        sentimentEmoji = '↘️';
        sentimentText = language === 'es'
          ? (trendStrength === 'strong' ? 'Bajista Fuerte' : 'Bajista')
          : (trendStrength === 'strong' ? 'Strong Bearish' : 'Bearish');
      } else {
        sentimentText = language === 'es' ? 'Neutral' : 'Neutral';
      }
      
      sentimentInfo = language === 'es'
        ? `${sentimentEmoji} Sentimiento: ${sentimentText} (${score > 0 ? '+' : ''}${score}/50)`
        : `${sentimentEmoji} Sentiment: ${sentimentText} (${score > 0 ? '+' : ''}${score}/50)`;
    }
    
    // Build call to action
    const cta = language === 'es'
      ? '📊 Visita Bolivia Blue para actualizaciones en tiempo real, gráficos históricos y análisis de sentimiento'
      : '📊 Visit Bolivia Blue for real-time updates, historical charts, and sentiment analysis';
    
    // Combine all parts
    const parts = [rateInfo];
    if (sentimentInfo) parts.push(sentimentInfo);
    parts.push(cta);
    parts.push(url);
    
    return parts.join('\n\n');
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const fullText = getShareText(); // Already includes URL at the end
    
    // For copy, use the full text as-is (already formatted with newlines)
    if (platform === 'copy') {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }
    
    // For social platforms, create a shorter version that fits better
    let rateInfo = '';
    if (currentRate && currentRate.buy && currentRate.sell) {
      const buyRate = currentRate.buy.toFixed(2);
      const sellRate = currentRate.sell.toFixed(2);
      rateInfo = language === 'es'
        ? `💰 Tasa Blue: Compra ${buyRate} BOB | Venta ${sellRate} BOB`
        : `💰 Blue Rate: Buy ${buyRate} BOB | Sell ${sellRate} BOB`;
    }
    
    let sentimentInfo = '';
    if (trendDetails && dailySentiment) {
      const score = trendDetails.score || 0;
      const trend = trendDetails.trend || 'neutral';
      const trendStrength = trendDetails.trendStrength || 'moderate';
      
      let sentimentEmoji = '➡️';
      let sentimentText = '';
      
      if (trend === 'bullish') {
        sentimentEmoji = '↗️';
        sentimentText = language === 'es' 
          ? (trendStrength === 'strong' ? 'Alcista Fuerte' : 'Alcista')
          : (trendStrength === 'strong' ? 'Strong Bullish' : 'Bullish');
      } else if (trend === 'bearish') {
        sentimentEmoji = '↘️';
        sentimentText = language === 'es'
          ? (trendStrength === 'strong' ? 'Bajista Fuerte' : 'Bajista')
          : (trendStrength === 'strong' ? 'Strong Bearish' : 'Bearish');
      } else {
        sentimentText = language === 'es' ? 'Neutral' : 'Neutral';
      }
      
      sentimentInfo = language === 'es'
        ? `${sentimentEmoji} Sentimiento: ${sentimentText} (${score > 0 ? '+' : ''}${score}/50)`
        : `${sentimentEmoji} Sentiment: ${sentimentText} (${score > 0 ? '+' : ''}${score}/50)`;
    }
    
    // Create compact version for social media (single line or two lines max)
    const socialText = language === 'es'
      ? `${rateInfo}${sentimentInfo ? ` | ${sentimentInfo}` : ''}\n\n📊 Visita Bolivia Blue para actualizaciones en tiempo real: ${url}`
      : `${rateInfo}${sentimentInfo ? ` | ${sentimentInfo}` : ''}\n\n📊 Visit Bolivia Blue for real-time updates: ${url}`;
    
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(socialText);
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        // Twitter has character limits, use compact version
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(rateInfo + (sentimentInfo ? ` | ${sentimentInfo}` : ''))}`;
        break;
      case 'whatsapp':
        // WhatsApp can handle longer messages better
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

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
    ? `Análisis avanzado basado en ${dailySentiment.total} artículos de las últimas 24h.\n\n` +
      `📊 Metodología:\n` +
      `• Fuerza del sentimiento (0-100): Cada artículo se analiza con IA para determinar qué tan impactante es para el dólar. ` +
      `Artículos con mayor impacto (crisis, devaluación, intervención BCB) tienen mayor peso.\n` +
      `• Validación con precios: La IA considera cambios de precio de las últimas 6h y 24h. ` +
      `Si el precio baja >3% pero el sentimiento es positivo, se ajusta automáticamente (fuerza reducida o neutral). ` +
      `Esto previene señales contradictorias (ej: precio baja 5% pero sentimiento totalmente positivo).\n` +
      `• Ponderación temporal: Artículos más recientes tienen mayor peso (decaimiento exponencial cada 12h).\n` +
      `• Categoría: Artículos de divisas tienen 1.5x peso vs. artículos generales.\n` +
      `• Límite por cantidad: El puntaje máximo escala con el número de artículos ` +
      `(1 artículo: ±20, 2 artículos: ±30, 3 artículos: ±35, 4 artículos: ±40, 5+: ±50).\n\n` +
      `📈 Métricas:\n` +
      `• Confianza: ${trendDetails.confidence}% (basada en tamaño de muestra)\n` +
      `• Puntuación ponderada: ↗ ${trendDetails.upScore} vs ↘ ${trendDetails.downScore}\n\n` +
      `💡 Interpretación:\n` +
      `• Positivo (+) = Dólar sube (más Bs por USD, ej: 10 → 11 BOB/USD)\n` +
      `• Negativo (-) = Dólar baja (menos Bs por USD, ej: 10 → 9 BOB/USD)`
    : `Advanced analysis based on ${dailySentiment.total} articles from last 24h.\n\n` +
      `📊 Methodology:\n` +
      `• Sentiment strength (0-100): Each article is analyzed with AI to determine how impactful it is for the dollar. ` +
      `Higher impact articles (crisis, devaluation, BCB intervention) have greater weight.\n` +
      `• Price validation: AI considers price changes from last 6h and 24h. ` +
      `If price drops >3% but sentiment is positive, it's automatically adjusted (strength reduced or neutralized). ` +
      `This prevents contradictory signals (e.g., price down 5% but sentiment fully positive).\n` +
      `• Time-weighted: More recent articles have higher weight (exponential decay every 12h).\n` +
      `• Category: Currency articles have 1.5x weight vs. general articles.\n` +
      `• Count-based capping: Maximum score scales with article count ` +
      `(1 article: ±20, 2 articles: ±30, 3 articles: ±35, 4 articles: ±40, 5+: ±50).\n\n` +
      `📈 Metrics:\n` +
      `• Confidence: ${trendDetails.confidence}% (based on sample size)\n` +
      `• Weighted score: ↗ ${trendDetails.upScore} vs ↘ ${trendDetails.downScore}\n\n` +
      `💡 Interpretation:\n` +
      `• Positive (+) = Dollar rising (more BOB per USD, e.g., 10 → 11 BOB/USD)\n` +
      `• Negative (-) = Dollar falling (fewer BOB per USD, e.g., 10 → 9 BOB/USD)`;

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
    <div className="bg-white dark:bg-[#121416] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-visible min-h-[220px] flex flex-col">
      {/* Top Bar - Sentiment Summary */}
      <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {language === 'es' ? "Sentimiento del USD hoy" : "Today's USD Sentiment"}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Share buttons */}
              <button
                onClick={() => handleShare('copy')}
                className={`p-1.5 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={language === 'es' ? 'Copiar tasa' : 'Copy rate'}
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                title={language === 'es' ? 'Compartir en WhatsApp' : 'Share on WhatsApp'}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title={language === 'es' ? 'Compartir en Twitter' : 'Share on Twitter'}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title={language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              {/* Info Icon - Larger touch target */}
              <button
                ref={infoIconRef}
                type="button"
                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
                aria-label={language === 'es' ? 'Información sobre el análisis de sentimiento' : 'Information about sentiment analysis'}
                onMouseEnter={() => handleTooltipToggle(true)}
                onMouseLeave={() => handleTooltipToggle(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTooltipToggle(!showTooltip);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {/* Tooltip */}
                {showTooltip && (
                  <div 
                    ref={tooltipRef}
                    className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 max-w-xs"
                    style={{ minWidth: '280px', maxWidth: '400px' }}
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-left whitespace-pre-line leading-relaxed">{tooltipText}</div>
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full">
                      <div className="border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Main Content Row: Score + Gauge + Counts */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-visible">
            {/* Score Display with Context - ENHANCED AND PROMINENT */}
            <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 flex-shrink-0 shadow-lg overflow-visible ${
              isPositive 
                ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600 dark:bg-green-900/30 dark:border-green-500' 
                : isNegative 
                ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-600 dark:bg-red-900/30 dark:border-red-500'
                : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-400 dark:bg-gray-800 dark:border-gray-600'
            }`}>
              <div className="flex flex-col items-center justify-center">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-1 ${
                  isPositive 
                    ? 'text-green-700 dark:text-green-300' 
                    : isNegative 
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {language === 'es' ? 'IA Score' : 'AI Score'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl md:text-5xl font-black tabular-nums leading-none ${
                    isPositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : isNegative 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {sentimentScore > 0 ? '+' : ''}{sentimentScore}
                  </span>
                  <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-semibold">/50</span>
                </div>
              </div>
            </div>

            {/* Gauge Visualization */}
            <div className="flex-1 min-w-0 px-2 sm:px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="relative w-full flex flex-col items-center">
                  {/* Track Container */}
                  <div className="relative w-full h-7 flex items-center overflow-visible rounded-full">
                    {/* Gradient background track */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-gray-500/10 to-green-500/20 dark:from-red-500/30 dark:via-gray-500/15 dark:to-green-500/30"></div>
                    
                    {/* Base track */}
                    <div className="absolute inset-0 rounded-full bg-gray-200/50 dark:bg-gray-700/50"></div>
                    
                    {/* Center line (neutral point) - more prominent */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-400 dark:bg-gray-500 z-10"></div>
                    
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
                            className="absolute w-px h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full transform -translate-x-1/2 z-10"
                            style={{ left: `${tickPosition}%` }}
                          ></div>
                        );
                      }
                      return ticks;
                    })()}
                    
                    {/* Major range markers: Left, Center, Right with values */}
                    <div className="absolute inset-0 flex items-center justify-between px-0.5">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-red-500 dark:bg-red-400 rounded-full z-10"></div>
                      </div>
                      <div className="w-0.5 h-4 bg-gray-500 dark:bg-gray-400 rounded-full z-10"></div>
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-green-500 dark:bg-green-400 rounded-full z-10"></div>
                      </div>
                    </div>
                    
                    {/* Indicator: Vertical line with downward arrow - More prominent with glow */}
                    <div 
                      className="absolute top-0 bottom-0 flex flex-col items-center transform -translate-x-1/2 transition-all duration-500 ease-out z-30"
                      style={{ left: `${compassPosition}%` }}
                    >
                      {/* Vertical indicator line - thicker and more visible with glow */}
                      <div 
                        className={`w-2 h-full rounded-full shadow-lg ${
                          isPositive 
                            ? 'bg-green-600 dark:bg-green-400 shadow-green-500/50' 
                            : isNegative 
                            ? 'bg-red-600 dark:bg-red-400 shadow-red-500/50'
                            : 'bg-gray-600 dark:bg-gray-400 shadow-gray-500/30'
                        }`}
                      ></div>
                      {/* Downward arrow - positioned within track bounds */}
                      <div 
                        className={`absolute bottom-0 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent ${
                          isPositive 
                            ? 'border-t-green-600 dark:border-t-green-400' 
                            : isNegative 
                            ? 'border-t-red-600 dark:border-t-red-400'
                            : 'border-t-gray-600 dark:border-t-gray-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Labels: Negative (left), Neutral (center), Positive (right) */}
                  <div className="absolute top-full left-0 right-0 flex items-center justify-between pt-1 px-0.5 text-[9px] font-medium">
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5">
                      {minRange}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      0
                    </span>
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                      +{maxRange}
                    </span>
                  </div>
                </div>
            </div>

            {/* Article Counts Compact - Right Side */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Total Articles */}
              <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{dailySentiment.total}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">art</span>
              </div>
              
              {/* Positive/Negative Pills */}
              {dailySentiment.up > 0 && (
                <div 
                  className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-emerald-900/30 border border-emerald-800 flex-shrink-0"
                  title={language === 'es' ? `${dailySentiment.up} artículos indican dólar subiendo` : `${dailySentiment.up} articles indicate dollar rising`}
                >
                  <span className="text-xs font-bold text-emerald-400">↗{dailySentiment.up}</span>
                </div>
              )}

              {dailySentiment.down > 0 && (
                <div 
                  className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-rose-900/30 border border-rose-800 flex-shrink-0"
                  title={language === 'es' ? `${dailySentiment.down} artículos indican dólar bajando` : `${dailySentiment.down} articles indicate dollar falling`}
                >
                  <span className="text-xs font-bold text-rose-400">↘{dailySentiment.down}</span>
                </div>
              )}
              
              {/* 24h Badge */}
              <div className="flex items-center px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-blue-900/20 border border-blue-800/50">
                <span className="text-[10px] sm:text-xs font-medium text-blue-400">24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Article Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-4 text-center flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'es' 
                ? 'No hay artículos recientes con movimiento de sentimiento.'
                : 'No recent articles with sentiment movement.'}
            </p>
          </div>
        ) : articles[currentIndex] ? (
          <div className="flex flex-col h-full">
            <a
              href={articles[currentIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group flex-shrink-0"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Favicon */}
                <div className="flex-shrink-0 mt-0.5 w-4 h-4">
                  {getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url) ? (
                    <img 
                      src={getFaviconUrl(articles[currentIndex].source, articles[currentIndex].url)} 
                      alt={articles[currentIndex].source}
                      className="w-4 h-4 rounded-sm"
                      width="16"
                      height="16"
                      loading="lazy"
                      decoding="async"
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
                  <div className="flex items-center gap-2 mb-1">
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
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
                    {cleanTitle(articles[currentIndex].title)}
                  </h3>
                  {articles[currentIndex].summary && cleanSummary(articles[currentIndex].summary) && (
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1 leading-snug mt-0.5 flex-shrink-0">
                      {cleanSummary(articles[currentIndex].summary)}
                    </p>
                  )}
                </div>

                {/* Sentiment Indicator */}
                <div className="flex-shrink-0">
                  <SentimentIndicator 
                    sentiment={articles[currentIndex].sentiment} 
                    strength={articles[currentIndex].sentiment_strength}
                    language={language}
                    size="sm"
                  />
                </div>
              </div>
            </a>

            {/* Navigation Controls */}
            {articles.length > 1 && (
              <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900/30 flex-shrink-0 gap-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                    aria-label={language === 'es' ? 'Artículo anterior' : 'Previous article'}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Progress Dots */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 justify-center">
                    <div className="flex gap-0.5 sm:gap-1">
                      {articles.slice(0, Math.min(articles.length, 8)).map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'bg-blue-600 dark:bg-blue-400 w-2 sm:w-3'
                              : 'bg-gray-300 dark:bg-gray-600 w-1 sm:w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1 sm:ml-2 whitespace-nowrap">
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
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
                    aria-label={language === 'es' ? 'Siguiente artículo' : 'Next article'}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SentimentNewsCard;
