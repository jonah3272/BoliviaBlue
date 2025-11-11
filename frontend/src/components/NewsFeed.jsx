import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import { formatTimeAgo } from '../utils/formatters';

// AI-Powered Sentiment Indicator
function SentimentArrow({ sentiment }) {
  if (!sentiment || sentiment === 'neutral') {
    return (
      <span className="text-gray-400 dark:text-gray-500" title="Neutral - No clear currency impact">
        ⚪
      </span>
    );
  }
  
  if (sentiment === 'up') {
    return (
      <span className="text-red-500" title="Dollar Rising - Boliviano Weakening">
        ↗️
      </span>
    );
  }
  
  if (sentiment === 'down') {
    return (
      <span className="text-green-500" title="Dollar Falling - Boliviano Strengthening">
        ↘️
      </span>
    );
  }
  
  return null;
}

function NewsCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
          {item.title}
        </h3>
        <div className="ml-2 flex-shrink-0 text-xl">
          <SentimentArrow sentiment={item.sentiment} />
        </div>
      </div>
      
      {item.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {item.summary}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">{item.source}</span>
        <span>{formatTimeAgo(item.published_at_iso)}</span>
      </div>
    </a>
  );
}

function NewsFeed() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNews(data.slice(0, 20)); // Show top 20 items
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
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Noticias relevantes
      </h2>
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsFeed;

