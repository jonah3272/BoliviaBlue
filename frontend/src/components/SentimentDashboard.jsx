import { useState, useEffect, useMemo } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Financial analytics-style sentiment dashboard component
 * Inspired by Binance and Kalshi dashboards
 */
function SentimentDashboard() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  const [articles, setArticles] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load articles and calculate sentiment
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allNews = await fetchNews(null, 100);
        
        // Filter articles from last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const dailyArticles = allNews.filter(article => {
          const publishedDate = article.published_at_iso || article.published_at;
          if (!publishedDate) return false;
          const articleDate = new Date(publishedDate);
          return !isNaN(articleDate.getTime()) && articleDate >= oneDayAgo;
        });
        
        // Calculate sentiment counts
        const upCount = dailyArticles.filter(a => a.sentiment === 'up').length;
        const downCount = dailyArticles.filter(a => a.sentiment === 'down').length;
        const neutralCount = dailyArticles.filter(a => a.sentiment === 'neutral' || !a.sentiment).length;
        const total = dailyArticles.length;
        
        // Determine overall sentiment
        let overallSentiment = 'neutral';
        if (upCount > downCount && upCount > neutralCount) {
          overallSentiment = 'positive';
        } else if (downCount > upCount && downCount > neutralCount) {
          overallSentiment = 'negative';
        }
        
        setSentimentData({
          overall: overallSentiment,
          total,
          up: upCount,
          down: downCount,
          neutral: neutralCount
        });
        
        // Get latest articles (most recent 5-8)
        const latestArticles = allNews
          .slice(0, 8)
          .map(article => {
            const publishedDate = new Date(article.published_at_iso || article.published_at);
            return {
              ...article,
              publishedDate
            };
          })
          .filter(article => !isNaN(article.publishedDate.getTime()));
        
        setArticles(latestArticles);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading sentiment data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return language === 'es' ? '<1h' : '<1h';
    } else if (diffHours < 24) {
      return language === 'es' ? `${diffHours}h` : `${diffHours}h`;
    } else if (diffDays === 1) {
      return language === 'es' ? '1d' : '1d';
    } else {
      return language === 'es' ? `${diffDays}d` : `${diffDays}d`;
    }
  };

  // Get source favicon URL
  const getSourceFavicon = (source) => {
    // Try to get favicon from common sources
    const sourceLower = source?.toLowerCase() || '';
    if (sourceLower.includes('google')) {
      return 'https://www.google.com/favicon.ico';
    }
    // Default favicon fallback
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(source)}&sz=32`;
  };

  // Sentiment pill component
  const SentimentPill = ({ sentiment, count, isActive }) => {
    const isPositive = sentiment === 'positive' || sentiment === 'up';
    const isNegative = sentiment === 'negative' || sentiment === 'down';
    const isNeutral = sentiment === 'neutral' || !sentiment;
    
    const bgColor = isActive
      ? (isPositive ? 'bg-[#00C48C]' : isNegative ? 'bg-red-500' : 'bg-[#262626]')
      : 'bg-[#181818]';
    const textColor = isActive
      ? 'text-[#0d0d0d]'
      : (isPositive ? 'text-[#00C48C]' : isNegative ? 'text-red-400' : 'text-[#a3a3a3]');
    const borderColor = isActive
      ? (isPositive ? 'border-[#00C48C]' : isNegative ? 'border-red-500' : 'border-[#262626]')
      : 'border-[#262626]';
    
    const icon = isPositive ? '↗' : isNegative ? '↘' : '○';
    const label = isPositive
      ? (language === 'es' ? 'Alza' : 'Up')
      : isNegative
      ? (language === 'es' ? 'Baja' : 'Down')
      : (language === 'es' ? 'Neutral' : 'Neutral');
    
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${bgColor} ${borderColor} ${textColor} transition-all cursor-pointer hover:opacity-80`}
      >
        <span className="text-sm font-semibold">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
        {count !== undefined && (
          <span className={`text-xs font-bold ${isActive ? 'text-[#0d0d0d]' : textColor}`}>
            {count}
          </span>
        )}
      </div>
    );
  };

  // Data tag component
  const DataTag = ({ value, label, className = '' }) => (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#181818] border border-[#262626] ${className}`}>
      <span className="text-xs font-bold text-[#f2f2f2]">{value}</span>
      <span className="text-[10px] text-[#a3a3a3]">{label}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-[#181818] rounded-xl border border-[#262626] p-4 md:p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#262626] rounded w-1/3"></div>
          <div className="h-20 bg-[#262626] rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#181818] rounded-xl border border-[#262626] p-4 md:p-6 shadow-sm">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!sentimentData || sentimentData.total === 0) {
    return null;
  }

  return (
    <div className="bg-[#181818] rounded-xl border border-[#262626] shadow-sm overflow-hidden">
      {/* Top Bar - Sentiment Summary */}
      <div className="p-4 md:p-6 border-b border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Label and Sentiment Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wide">
              {language === 'es' ? 'Sentimiento del día' : 'Daily Sentiment'}
            </span>
            
            <div className="flex items-center gap-2 flex-wrap">
              <SentimentPill
                sentiment="neutral"
                count={sentimentData.neutral}
                isActive={sentimentData.overall === 'neutral'}
              />
              <SentimentPill
                sentiment="positive"
                count={sentimentData.up}
                isActive={sentimentData.overall === 'positive'}
              />
              <SentimentPill
                sentiment="negative"
                count={sentimentData.down}
                isActive={sentimentData.overall === 'negative'}
              />
            </div>
          </div>
          
          {/* Right: Article Count and Timeframe */}
          <div className="flex items-center gap-2">
            <DataTag
              value={sentimentData.total}
              label={language === 'es' ? 'artículos' : 'articles'}
            />
            <DataTag
              value="24h"
              label=""
              className="bg-[#0d0d0d]"
            />
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="divide-y divide-[#262626]">
        {articles.length === 0 ? (
          <div className="p-4 md:p-6 text-center">
            <p className="text-sm text-[#a3a3a3]">
              {language === 'es' ? 'No hay artículos disponibles' : 'No articles available'}
            </p>
          </div>
        ) : (
          articles.map((article) => {
            const sentiment = article.sentiment || 'neutral';
            const isPositive = sentiment === 'up';
            const isNegative = sentiment === 'down';
            
            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 md:p-6 hover:bg-[#0d0d0d] transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Source Favicon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <img
                      src={getSourceFavicon(article.source)}
                      alt={article.source}
                      className="w-5 h-5 rounded"
                      onError={(e) => {
                        e.target.src = 'https://www.google.com/s2/favicons?domain=google.com&sz=32';
                      }}
                    />
                  </div>
                  
                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#f2f2f2] group-hover:text-[#00C48C] transition-colors line-clamp-2 mb-2 leading-snug">
                      {article.title}
                    </h3>
                    
                    {/* Source and Time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#a3a3a3] uppercase">
                        {article.source}
                      </span>
                      <span className="text-[10px] text-[#666]">•</span>
                      <span className="text-xs text-[#a3a3a3]">
                        {formatTimeAgo(article.publishedDate)}
                      </span>
                      
                      {/* Sentiment Indicator */}
                      {(isPositive || isNegative) && (
                        <>
                          <span className="text-[10px] text-[#666]">•</span>
                          <span
                            className={`text-xs font-semibold ${
                              isPositive ? 'text-[#00C48C]' : 'text-red-400'
                            }`}
                          >
                            {isPositive ? '↗' : '↘'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SentimentDashboard;

