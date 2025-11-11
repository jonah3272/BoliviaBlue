import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

function RotatingNewsCarousel() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // Fetch all news
        const allNews = await fetchNews(null, 100);
        
        // Filter for articles from the past 24 hours with up or down sentiment
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const filteredArticles = allNews.filter(article => {
          const articleDate = new Date(article.published_at);
          const hasMovement = article.sentiment === 'up' || article.sentiment === 'down';
          const isRecent = articleDate >= oneDayAgo;
          return hasMovement && isRecent;
        });
        
        // Sort by most recent first
        filteredArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        
        setArticles(filteredArticles);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading rotating articles:', error);
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // Don't show anything if no articles
  }

  const currentArticle = articles[currentIndex];
  const sentimentColor = currentArticle.sentiment === 'up' 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  const sentimentBg = currentArticle.sentiment === 'up'
    ? 'bg-green-100 dark:bg-green-900/30'
    : 'bg-red-100 dark:bg-red-900/30';
  const sentimentIcon = currentArticle.sentiment === 'up' ? '↗' : '↘';

  return (
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
                const date = new Date(currentArticle.published_at);
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
  );
}

export default RotatingNewsCarousel;

