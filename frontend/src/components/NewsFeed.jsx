import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/api';
import { formatTimeAgo } from '../utils/formatters';

function SentimentBadge({ sentiment }) {
  if (sentiment === 'neutral') return null;
  
  const colors = {
    up: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    down: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  };
  
  const labels = {
    up: '↑ Alza',
    down: '↓ Baja'
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[sentiment]}`}>
      {labels[sentiment]}
    </span>
  );
}

function NewsCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
          {item.title}
        </h3>
        <SentimentBadge sentiment={item.sentiment} />
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

