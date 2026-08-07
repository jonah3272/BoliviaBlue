import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { fetchNews } from '../utils/api';
import { newsArticlePath } from '../utils/newsSlug';
import SentimentLegend from '../components/SentimentLegend';
import { cleanSummary, cleanTitle } from '../utils/formatters';
import { blockAdsOnThisPage } from '../utils/adsenseLoader';

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

import SentimentIndicator from '../components/SentimentIndicator';

function News() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [news, setNews] = useState([]);
  const [allNews, setAllNews] = useState([]); // Store all news for search
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Block ads on news aggregation page (AdSense policy compliance - reduce "low value content" risk)
  // This page aggregates external news and is excluded from AdSense monetization
  useEffect(() => {
    blockAdsOnThisPage();
  }, []);

  // Structured data for News page
  const newsPageSchema = news.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": language === 'es' ? "Noticias Económicas - Bolivia Blue con Paz" : "Economic News - Bolivia Blue with Paz",
    "description": language === 'es'
      ? "Últimas noticias financieras y económicas de Bolivia relacionadas con el tipo de cambio del dólar blue"
      : "Latest financial and economic news from Bolivia related to the blue dollar exchange rate",
    "url": "https://boliviablue.com/noticias",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": news.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.summary || article.title,
          "url": `https://boliviablue.com${newsArticlePath(article)}`,
          "datePublished": article.published_at_iso,
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
      setAllNews(data); // Store for search
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
          ? "Noticias Dólar Blue Bolivia | Actualizado Cada 5 Min | Análisis IA"
          : "Bolivia Blue Dollar News | Updated Every 5 Min | AI Analysis"}
        description={language === 'es'
          ? "Últimas noticias financieras y económicas de Bolivia relacionadas con el tipo de cambio del dólar blue. Actualizado cada 5 minutos. Análisis de sentimiento con IA. Gratis."
          : "Latest financial and economic news from Bolivia related to the blue dollar exchange rate. Updated every 5 minutes. AI sentiment analysis. Free."}
        keywords={language === 'es'
          ? "noticias bolivia, noticias económicas bolivia, noticias dólar blue, noticias rodrigo paz, economía bolivia, noticias tipo cambio bolivia, noticias mercado cambiario bolivia, análisis sentimiento dólar bolivia, noticias financieras bolivia, mejor fuente noticias bolivia"
          : "bolivia news, economic news bolivia, blue dollar news, rodrigo paz news, bolivia economy, bolivia exchange rate news, bolivia currency market news, bolivia dollar sentiment analysis, bolivia financial news, best bolivia news source"}
        canonical="/noticias"
        structuredData={newsPageSchema}
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Rate Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4">
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8"/>
              </svg>
              {language === 'es' ? 'Actualizado cada 5 minutos' : 'Updated every 5 minutes'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Noticias del Mercado Cambiario' : 'Currency Market News'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'es' 
                ? 'Análisis con IA del sentimiento de noticias económicas y su impacto en el dólar blue. Mantente informado sobre lo que mueve el mercado.' 
                : 'AI-powered sentiment analysis of economic news and its impact on the blue dollar. Stay informed about what moves the market.'}
            </p>
          </div>
          
          {/* Quick Stats - Improved Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {news.length}+
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Noticias Hoy' : 'News Today'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg border-2 border-green-200 dark:border-green-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Análisis con IA' : 'AI Analysis'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {availableCategories.length - 1}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Categorías' : 'Categories'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Search Bar */}
        <div className="px-1">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar noticias...' : 'Search news...'}
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                // Filter news based on search term
                if (searchTerm) {
                  const filtered = allNews.filter(article => 
                    article.title.toLowerCase().includes(searchTerm) ||
                    (article.summary && article.summary.toLowerCase().includes(searchTerm))
                  );
                  setNews(filtered);
                } else {
                  setNews(allNews);
                }
              }}
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sentiment Legend - Using compact version to match dashboard */}
        <div className="px-1">
          <SentimentLegend compact={true} />
        </div>
        
        {/* Category Filters - Only show categories with articles */}
        <div className="flex flex-wrap gap-2 px-1">
          {Object.entries(CATEGORIES).filter(([key]) => availableCategories.includes(key)).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === key
                  ? `bg-${cat.color}-500 text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <CategoryIcon category={key} />
              <span className="whitespace-nowrap">{language === 'es' ? cat.es : cat.en}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {news.map((article, index) => {
              const cat = CATEGORIES[article.category] || CATEGORIES.all;
              return (
                <motion.article
                  key={article.id}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all p-4 sm:p-5 md:p-6 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Category Badge & Sentiment */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-700 dark:text-${cat.color}-300 flex-shrink-0`}>
                      <CategoryIcon category={article.category} />
                      <span className="whitespace-nowrap">{language === 'es' ? cat.es : cat.en}</span>
                    </span>
                    <div className="flex-shrink-0">
                      <SentimentIndicator 
                        sentiment={article.sentiment} 
                        strength={article.sentiment_strength}
                        language={language}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">
                    {cleanTitle(article.title)}
                  </h3>

                  {/* Summary */}
                  {article.summary && cleanSummary(article.summary) && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-3 flex-grow">
                      {cleanSummary(article.summary)}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4">
                    <span className="font-medium">{article.source}</span>
                    <span>{formatDate(article.published_at_iso)}</span>
                  </div>

                  {/* Internal article page (SEO) + external source */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to={newsArticlePath(article)}
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {language === 'es' ? 'Ver en Bolivia Blue' : 'View on Bolivia Blue'} →
                    </Link>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 text-sm font-medium"
                      >
                        {language === 'es' ? 'Fuente' : 'Source'} ↗
                      </a>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Additional Content Section for AdSense Compliance */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 md:p-10 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' 
                  ? 'Importancia de las Noticias Económicas para el Tipo de Cambio'
                  : 'Importance of Economic News for Exchange Rates'}
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {language === 'es' 
                  ? 'Las noticias económicas y financieras juegan un papel crucial en la determinación del tipo de cambio del dólar blue en Bolivia. Los eventos políticos, decisiones económicas del gobierno, políticas del Banco Central, y noticias internacionales pueden causar fluctuaciones significativas en el precio del dólar en el mercado paralelo.'
                  : 'Economic and financial news plays a crucial role in determining the blue dollar exchange rate in Bolivia. Political events, government economic decisions, Central Bank policies, and international news can cause significant fluctuations in the dollar price in the parallel market.'}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Interpretar el Sentimiento de las Noticias'
                  : 'How to Interpret News Sentiment'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {language === 'es' 
                  ? 'Nuestra plataforma utiliza inteligencia artificial para analizar el sentimiento de las noticias y determinar si tienen un impacto positivo (↗), negativo (↘), o neutral (○) en el tipo de cambio. Este análisis ayuda a los usuarios a entender cómo las noticias pueden afectar el precio del dólar blue.'
                  : 'Our platform uses artificial intelligence to analyze news sentiment and determine if they have a positive (↗), negative (↘), or neutral (○) impact on the exchange rate. This analysis helps users understand how news can affect the blue dollar price.'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Sentimiento Positivo (↗):</strong> Noticias que pueden hacer subir el dólar blue, como restricciones cambiarias, inflación, o incertidumbre política</li>
                    <li><strong>Sentimiento Negativo (↘):</strong> Noticias que pueden hacer bajar el dólar blue, como estabilidad económica, políticas favorables, o mayor disponibilidad de dólares</li>
                    <li><strong>Sentimiento Neutral (○):</strong> Noticias que no tienen un impacto claro en el tipo de cambio</li>
                  </>
                ) : (
                  <>
                    <li><strong>Positive Sentiment (↗):</strong> News that may cause the blue dollar to rise, such as exchange restrictions, inflation, or political uncertainty</li>
                    <li><strong>Negative Sentiment (↘):</strong> News that may cause the blue dollar to fall, such as economic stability, favorable policies, or greater dollar availability</li>
                    <li><strong>Neutral Sentiment (○):</strong> News that has no clear impact on the exchange rate</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Categorías de Noticias'
                  : 'News Categories'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {language === 'es' 
                  ? 'Organizamos las noticias en diferentes categorías para facilitar la navegación:'
                  : 'We organize news into different categories to facilitate navigation:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Divisas:</strong> Noticias específicas sobre el tipo de cambio y el mercado de divisas</li>
                    <li><strong>Economía:</strong> Noticias sobre la economía boliviana y su impacto en el mercado cambiario</li>
                    <li><strong>Banca:</strong> Noticias sobre el sistema bancario y políticas del Banco Central</li>
                    <li><strong>Política:</strong> Decisiones políticas que pueden afectar la economía y el tipo de cambio</li>
                    <li><strong>Internacional:</strong> Noticias globales que pueden influir en el mercado boliviano</li>
                    <li><strong>Mercados:</strong> Análisis de mercados financieros y tendencias económicas</li>
                  </>
                ) : (
                  <>
                    <li><strong>Currency:</strong> Specific news about exchange rates and the foreign exchange market</li>
                    <li><strong>Economy:</strong> News about the Bolivian economy and its impact on the exchange market</li>
                    <li><strong>Banking:</strong> News about the banking system and Central Bank policies</li>
                    <li><strong>Politics:</strong> Political decisions that may affect the economy and exchange rate</li>
                    <li><strong>International:</strong> Global news that may influence the Bolivian market</li>
                    <li><strong>Markets:</strong> Financial market analysis and economic trends</li>
                  </>
                )}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {language === 'es' 
                  ? 'Cómo Usar las Noticias para Tomar Decisiones'
                  : 'How to Use News to Make Decisions'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {language === 'es' 
                  ? 'Las noticias económicas pueden ser una herramienta valiosa para tomar decisiones informadas sobre cuándo comprar o vender dólares:'
                  : 'Economic news can be a valuable tool for making informed decisions about when to buy or sell dollars:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Monitorea regularmente:</strong> Revisa las noticias diariamente para estar al tanto de eventos que puedan afectar el mercado</li>
                    <li><strong>Analiza el sentimiento:</strong> Presta atención al sentimiento de las noticias para anticipar movimientos del mercado</li>
                    <li><strong>Combina con datos:</strong> Usa las noticias junto con nuestros gráficos históricos para tener una visión completa</li>
                    <li><strong>No reacciones exageradamente:</strong> Las noticias pueden causar volatilidad temporal, pero es importante considerar tendencias a largo plazo</li>
                    <li><strong>Consulta múltiples fuentes:</strong> Siempre verifica la información de múltiples fuentes confiables</li>
                  </>
                ) : (
                  <>
                    <li><strong>Monitor regularly:</strong> Review news daily to stay aware of events that may affect the market</li>
                    <li><strong>Analyze sentiment:</strong> Pay attention to news sentiment to anticipate market movements</li>
                    <li><strong>Combine with data:</strong> Use news along with our historical charts for a complete view</li>
                    <li><strong>Don't overreact:</strong> News can cause temporary volatility, but it's important to consider long-term trends</li>
                    <li><strong>Consult multiple sources:</strong> Always verify information from multiple reliable sources</li>
                  </>
                )}
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mt-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '📰 Sobre Nuestro Feed de Noticias' : '📰 About Our News Feed'}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'es'
                    ? <>Nuestro feed de noticias se actualiza automáticamente cada 5 minutos, agregando noticias de múltiples fuentes confiables de Bolivia. Utilizamos inteligencia artificial para analizar el sentimiento y categorizar las noticias, ayudándote a entender rápidamente cómo pueden afectar el mercado cambiario. Todas las noticias incluyen enlaces a las fuentes originales para que puedas leer los artículos completos.</>
                    : <>Our news feed updates automatically every 5 minutes, aggregating news from multiple reliable sources in Bolivia. We use artificial intelligence to analyze sentiment and categorize news, helping you quickly understand how they may affect the exchange market. All news includes links to original sources so you can read the full articles.</>}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default News;

