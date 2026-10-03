import { useState, useEffect } from 'react';
import { fetchTweets } from '../utils/api';
import { cleanSummary, cleanTitle } from '../utils/formatters';
import { storedTweetDate, newestStoredTweetDate, formatStoredTweetDate } from '../utils/storedTweetDates';
import { useLanguage } from '../contexts/LanguageContext';
import SentimentIndicator from './SentimentIndicator';

function TweetCard({ tweet, language = 'es' }) {
  const publishedAt = storedTweetDate(tweet);
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
          {publishedAt ? <time dateTime={publishedAt}>{formatStoredTweetDate(publishedAt, language)}</time> : formatStoredTweetDate(null, language)}
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
  const language = languageContext?.language || 'es';
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let latestRequest = 0;
    const loadTweets = async () => {
      const request = ++latestRequest;
      setIsLoading(true);
      try {
        const data = await fetchTweets(maxItems);
        if (!cancelled && request === latestRequest) {
          setTweets(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading tweets:', err);
        if (!cancelled && request === latestRequest) setError(err.message || 'unavailable');
      } finally {
        if (!cancelled && request === latestRequest) setIsLoading(false);
      }
    };

    loadTweets();
    
    // Re-read stored rows every two minutes; this does not fetch new posts from X.
    const interval = setInterval(loadTweets, 120000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [maxItems]);

  const newestDate = newestStoredTweetDate(tweets);
  return (
    <section className="space-y-4" aria-label={language === 'es' ? 'Publicaciones guardadas de X' : 'Stored X posts'}>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 text-sm text-gray-600 dark:text-gray-300">
        <h3 className="font-semibold text-gray-900 dark:text-white">{language === 'es' ? 'Publicaciones guardadas de X' : 'Stored X posts'}</h3>
        <p className="mt-1">{language === 'es' ? 'Este archivo no es un flujo en vivo. No hay una actualización automática de publicaciones nuevas de X verificada.' : 'This archive is not a live feed. Automatic retrieval of new X posts has not been verified.'}</p>
        {newestDate && <p className="mt-2 text-xs">{language === 'es' ? 'Fecha más reciente del archivo' : 'Newest date in this archive'}: <time dateTime={newestDate}>{formatStoredTweetDate(newestDate, language)}</time></p>}
      </div>
      {isLoading ? <div className="space-y-4" role="status" aria-busy="true">
        <p className="sr-only">{language === 'es' ? 'Cargando archivo' : 'Loading archive'}</p>
        {[0, 1, 2].map((index) => <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />)}
      </div> : error ? <p role="status" className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">{language === 'es' ? 'No se pudo consultar el archivo en este momento. Volvé a intentarlo más tarde.' : 'The archive could not be loaded right now. Please try again later.'}</p>
      : tweets.length === 0 ? <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">{language === 'es' ? 'Todavía no hay publicaciones guardadas para mostrar.' : 'There are no stored posts to show yet.'}</p>
      : tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} language={language} />)}
    </section>
  );
}

export default TweetsFeed;
