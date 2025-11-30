import { useState } from 'react';
import NewsFeed from './NewsFeed';
import TweetsFeed from './TweetsFeed';
import { useLanguage } from '../contexts/LanguageContext';

function NewsTabs() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  // Default to 'news' (Economic News / Articles that influence sentiment)
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b-2 border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold border-b-4 transition-all ${
              activeTab === 'news'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>{language === 'es' ? 'Noticias Económicas' : 'Economic News'}</span>
            </span>
            {activeTab === 'news' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                {language === 'es' ? 'Artículos que influyen en el sentimiento' : 'Articles influencing sentiment'}
              </div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('twitter')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold border-b-4 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'twitter'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>{t('twitterSection')}</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'twitter' && <TweetsFeed maxItems={20} />}
      </div>
    </div>
  );
}

export default NewsTabs;

