import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const CATEGORIES = {
  all: { es: 'Todas', en: 'All', icon: '📰', color: 'gray' },
  currency: { es: 'Divisas', en: 'Currency', icon: '💱', color: 'green' },
  economy: { es: 'Economía', en: 'Economy', icon: '📊', color: 'blue' },
  banking: { es: 'Banca', en: 'Banking', icon: '🏦', color: 'purple' },
  politics: { es: 'Política', en: 'Politics', icon: '🏛️', color: 'red' },
  international: { es: 'Internacional', en: 'International', icon: '🌎', color: 'indigo' },
  markets: { es: 'Mercados', en: 'Markets', icon: '📈', color: 'amber' }
};

function News() {
  const { t, language } = useLanguage();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '30' });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error('Failed to load news');
      
      const data = await response.json();
      setNews(data);
      setError(null);
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES[category] || CATEGORIES.all;
    return cat.color;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return language === 'es' ? 'Hace menos de 1 hora' : 'Less than 1 hour ago';
    } else if (diffHours < 24) {
      return language === 'es' ? `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}` : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return language === 'es' ? `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bolivia Blue
              </h1>
            </Link>
            <div className="flex gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Link
              to="/"
              className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/calculator"
              className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              🧮 {language === 'es' ? 'Calculadora' : 'Calculator'}
            </Link>
            <Link
              to="/news"
              className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            >
              📰 {language === 'es' ? 'Noticias' : 'News'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Noticias Económicas' : 'Economic News'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Últimas noticias sobre economía, política y finanzas de Bolivia'
              : 'Latest news about Bolivia\'s economy, politics and finance'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === key
                  ? `bg-${cat.color}-500 text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.icon} {language === 'es' ? cat.es : cat.en}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'Cargando noticias...' : 'Loading news...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{language === 'es' ? 'Error al cargar noticias' : 'Error loading news'}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'No hay noticias disponibles' : 'No news available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => {
              const cat = CATEGORIES[article.category] || CATEGORIES.all;
              return (
                <article
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all p-6 flex flex-col"
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-700 dark:text-${cat.color}-300`}>
                      {cat.icon} {language === 'es' ? cat.es : cat.en}
                    </span>
                    {article.sentiment !== 'neutral' && (
                      <span className={`text-lg ${article.sentiment === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {article.sentiment === 'up' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium">{article.source}</span>
                    <span>{formatDate(article.published_at_iso)}</span>
                  </div>

                  {/* Read More Link */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {language === 'es' ? 'Leer más' : 'Read more'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 {t('title')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default News;

