import { useState, useEffect } from 'react';
import { fetchTweets } from '../utils/api';
import { formatTimeAgo, cleanSummary, cleanTitle } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';
import SentimentIndicator from './SentimentIndicator';

function TweetCard({ tweet, language = 'es' }) {
  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {/* Twitter/X Icon */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">
              {cleanTitle(tweet.title)}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <SentimentIndicator 
            sentiment={tweet.sentiment} 
            strength={tweet.sentiment_strength}
            language={language}
            size="sm"
          />
        </div>
      </div>
      
      {tweet.summary && cleanSummary(tweet.summary) && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {cleanSummary(tweet.summary)}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-500">
          {formatTimeAgo(tweet.published_at)}
        </span>
        {tweet.category && tweet.category !== 'general' && (
          <span className="px-2.5 py-1 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold shadow-sm">
            {tweet.category}
          </span>
        )}
      </div>
    </a>
  );
}

function TweetsFeed({ maxItems = 10 }) {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTweets = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTweets(maxItems);
        setTweets(data);
        setError(null);
      } catch (err) {
        console.error('Error loading tweets:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTweets();
    
    // Refresh every 2 minutes (tweets are more real-time)
    const interval = setInterval(loadTweets, 120000);
    return () => clearInterval(interval);
  }, [maxItems]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          {t('errorLoadingTweets')}
        </p>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          {t('noTweetsAvailable')}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {language === 'es' 
            ? 'Agrega TWITTER_BEARER_TOKEN a Railway para activar' 
            : 'Add TWITTER_BEARER_TOKEN to Railway to activate'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map(tweet => (
        <TweetCard key={tweet.id} tweet={tweet} language={language} />
      ))}
    </div>
  );
}

export default TweetsFeed;

