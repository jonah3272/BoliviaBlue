import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { fetchNews } from '../utils/api';
import SentimentLegend from '../components/SentimentLegend';

const CATEGORIES = {
  all: { es: 'Todas', en: 'All', color: 'gray' },
  currency: { es: 'Divisas', en: 'Currency', color: 'green' },
  economy: { es: 'Economía', en: 'Economy', color: 'blue' },
  banking: { es: 'Banca', en: 'Banking', color: 'purple' },
  politics: { es: 'Política', en: 'Politics', color: 'red' },
  international: { es: 'Internacional', en: 'International', color: 'indigo' },
  markets: { es: 'Mercados', en: 'Markets', color: 'amber' }
};

const CategoryIcon = ({ category }) => {
  const icons = {
    all: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    currency: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    economy: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    banking: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
    politics: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    international: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    markets: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  };
  return icons[category] || icons.all;
};

// AI-Powered Sentiment Indicator - Matches legend colors
const SentimentArrow = ({ sentiment, language }) => {
  if (!sentiment || sentiment === 'neutral') {
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/50">
        <span className="text-xl text-gray-500 dark:text-gray-400" title={language === 'es' ? 'Neutral - Sin impacto claro en divisas' : 'Neutral - No clear currency impact'}>
          ○
        </span>
      </div>
    );
  }
  
  if (sentiment === 'up') {
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
        <span className="text-2xl font-bold text-green-600 dark:text-green-400" title={language === 'es' ? 'Dólar Subiendo - Boliviano Debilitándose' : 'Dollar Rising - Boliviano Weakening'}>
          ↗
        </span>
      </div>
    );
  }
  
  if (sentiment === 'down') {
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
        <span className="text-2xl font-bold text-red-600 dark:text-red-400" title={language === 'es' ? 'Dólar Bajando - Boliviano Fortaleciéndose' : 'Dollar Falling - Boliviano Strengthening'}>
          ↘
        </span>
      </div>
    );
  }
  
  return null;
};

function News() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Structured data for News page
  const newsPageSchema = news.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": language === 'es' ? "Noticias Económicas - Bolivia Blue con Paz" : "Economic News - Bolivia Blue with Paz",
    "description": language === 'es'
      ? "Últimas noticias financieras y económicas de Bolivia relacionadas con el tipo de cambio del dólar blue"
      : "Latest financial and economic news from Bolivia related to the blue dollar exchange rate",
    "url": "https://boliviablue.com/news",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": news.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.summary || article.title,
          "url": article.url,
          "datePublished": article.published_at,
          "publisher": {
            "@type": "Organization",
            "name": article.source || "Bolivia Blue con Paz"
          }
        }
      }))
    }
  } : null;

  // Get available categories (only those with articles)
  const [availableCategories, setAvailableCategories] = useState(['all']);
  
  useEffect(() => {
    loadNews();
    
    // Also fetch all news to determine which categories have articles
    const checkCategories = async () => {
      try {
        const allNews = await fetchNews('all', 100);
        const categoriesWithArticles = new Set(['all']);
        allNews.forEach(article => {
          if (article.category) {
            categoriesWithArticles.add(article.category);
          }
        });
        setAvailableCategories(Array.from(categoriesWithArticles));
      } catch (err) {
        console.error('Error checking categories:', err);
      }
    };
    
    checkCategories();
  }, [selectedCategory]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory !== 'all' ? selectedCategory : null;
      const data = await fetchNews(category, 30);
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
      <PageMeta
        title={language === 'es' 
          ? "Noticias Económicas - Bolivia Blue con Paz | Mejor que bolivianblue.net"
          : "Economic News - Bolivia Blue with Paz | Better than bolivianblue.net"}
        description={language === 'es'
          ? "Últimas noticias financieras y económicas de Bolivia relacionadas con el tipo de cambio del dólar blue, la presidencia de Rodrigo Paz, y el mercado cambiario. Actualizado cada 5 minutos. Análisis de sentimiento con IA. Mejor que bolivianblue.net."
          : "Latest financial and economic news from Bolivia related to the blue dollar exchange rate, Rodrigo Paz's presidency, and the exchange market. Updated every 5 minutes. AI sentiment analysis. Better than bolivianblue.net."}
        keywords={language === 'es'
          ? "noticias bolivia, noticias económicas bolivia, noticias dólar blue, noticias rodrigo paz, economía bolivia, noticias tipo cambio bolivia, noticias mercado cambiario bolivia, análisis sentimiento dólar bolivia, noticias financieras bolivia, mejor fuente noticias bolivia"
          : "bolivia news, economic news bolivia, blue dollar news, rodrigo paz news, bolivia economy, bolivia exchange rate news, bolivia currency market news, bolivia dollar sentiment analysis, bolivia financial news, best bolivia news source"}
        canonical="/news"
        structuredData={newsPageSchema}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Bolivia Blue
              </h1>
            </Link>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Noticias Económicas' : 'Economic News'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('newsSubtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Breadcrumbs />
        {/* Sentiment Legend - Using compact version to match dashboard */}
        <SentimentLegend compact={true} />
        
        {/* Category Filters - Only show categories with articles */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).filter(([key]) => availableCategories.includes(key)).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === key
                  ? `bg-${cat.color}-500 text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <CategoryIcon category={key} />
              {language === 'es' ? cat.es : cat.en}
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
            <p className="text-red-500">{t('errorLoadingNews')}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('noNewsAvailable')}
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
                  {/* Category Badge & Sentiment */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-700 dark:text-${cat.color}-300`}>
                      <CategoryIcon category={article.category} />
                      {language === 'es' ? cat.es : cat.en}
                    </span>
                    <SentimentArrow sentiment={article.sentiment} language={language} />
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

