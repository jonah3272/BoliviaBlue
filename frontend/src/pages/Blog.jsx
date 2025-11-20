import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import BlueRateCards from '../components/BlueRateCards';
import BinanceBanner from '../components/BinanceBanner';
import SocialShare from '../components/SocialShare';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchBlogArticles, fetchBlogArticleBySlug } from '../utils/blogApi';
import { articlesEs, articlesEn } from '../data/blogArticles'; // Fallback

function Blog() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showOfficial, setShowOfficial] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch articles from Supabase (only when not viewing a single article)
  useEffect(() => {
    if (!slug) {
      const loadArticles = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Loading blog articles from Supabase for language:', language);
          const supabaseArticles = await fetchBlogArticles(language);
          console.log('Supabase articles loaded:', supabaseArticles?.length || 0);
          
          // If Supabase returns articles, use them; otherwise fallback to local
          if (supabaseArticles && supabaseArticles.length > 0) {
            // Transform Supabase format to match expected format
            const transformedArticles = supabaseArticles.map(article => ({
              id: article.id,
              slug: article.slug,
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              contentFormat: article.content_format || 'html',
              author: article.author,
              category: article.category,
              featured: article.featured,
              readTime: article.read_time ? `${article.read_time} min` : null,
              date: article.published_at || article.created_at
            }));
            console.log('Using Supabase articles:', transformedArticles.length);
            setArticles(transformedArticles);
          } else {
            console.log('No Supabase articles found, using local fallback');
            // Fallback to local articles if Supabase is empty
            const fallbackArticles = language === 'es' ? articlesEs : articlesEn;
            setArticles(fallbackArticles);
          }
        } catch (err) {
          console.error('Error loading blog articles:', err);
          setError(err.message);
          // Fallback to local articles on error
          const fallbackArticles = language === 'es' ? articlesEs : articlesEn;
          setArticles(fallbackArticles);
        } finally {
          setIsLoading(false);
        }
      };

      loadArticles();
    }
  }, [language, slug]);

  // Load article by slug from URL params
  useEffect(() => {
    if (slug) {
      const loadArticleBySlug = async () => {
        setIsLoading(true);
        try {
          console.log('Loading article from Supabase:', slug, language);
          const article = await fetchBlogArticleBySlug(slug, language);
          if (article) {
            console.log('Article loaded from Supabase:', article.title);
            setSelectedArticle({
              id: article.id,
              slug: article.slug,
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              contentFormat: article.content_format || 'html',
              author: article.author,
              category: article.category,
              featured: article.featured,
              readTime: article.read_time ? `${article.read_time} min` : null,
              date: article.published_at || article.created_at
            });
          } else {
            console.log('Article not found in Supabase, trying local fallback');
            // Fallback: try to find in local articles
            const fallbackArticles = language === 'es' ? articlesEs : articlesEn;
            const localArticle = fallbackArticles.find(a => a.slug === slug);
            if (localArticle) {
              console.log('Article found in local fallback:', localArticle.title);
              setSelectedArticle(localArticle);
            } else {
              console.warn('Article not found in Supabase or local fallback');
            }
          }
        } catch (err) {
          console.error('Error loading article by slug:', err);
          // Fallback: try to find in local articles
          const fallbackArticles = language === 'es' ? articlesEs : articlesEn;
          const localArticle = fallbackArticles.find(a => a.slug === slug);
          if (localArticle) {
            setSelectedArticle(localArticle);
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadArticleBySlug();
    } else {
      // Clear selected article when no slug (on /blog page)
      setSelectedArticle(null);
    }
  }, [slug, language]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedArticleData = selectedArticle 
    ? (typeof selectedArticle === 'object' 
        ? selectedArticle 
        : articles.find(a => a.id === selectedArticle || a.slug === selectedArticle))
    : null;

  // Blog collection schema for SEO
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": language === 'es' ? "Blog - Bolivia Blue con Paz" : "Blog - Bolivia Blue with Paz",
    "description": language === 'es' 
      ? "Artículos y análisis sobre el dólar blue, criptomonedas, USDT y finanzas personales en Bolivia"
      : "Articles and analysis about the blue dollar, cryptocurrencies, USDT and personal finance in Bolivia",
    "url": "https://boliviablue.com/blog",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": article.title,
          "datePublished": article.date,
          "author": {
            "@type": "Organization",
            "name": article.author
          }
        }
      }))
    }
  };

  if (selectedArticleData) {
    // Article detail view
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedArticleData.title,
      "datePublished": selectedArticleData.date,
      "author": {
        "@type": "Organization",
        "name": selectedArticleData.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bolivia Blue con Paz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://boliviablue.com/favicon.svg"
        }
      },
      "description": selectedArticleData.excerpt
    };

    return (
      <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
        <PageMeta
          title={selectedArticleData.title + ' - ' + (language === 'es' ? 'Blog Bolivia Blue' : 'Bolivia Blue Blog')}
          description={selectedArticleData.excerpt}
          keywords={language === 'es'
            ? `${selectedArticleData.category.toLowerCase()}, dólar blue bolivia, tipo de cambio bolivia, binance p2p, usdt bolivia, finanzas personales bolivia`
            : `${selectedArticleData.category.toLowerCase()}, blue dollar bolivia, exchange rate bolivia, binance p2p, usdt bolivia, personal finance bolivia`}
          canonical={`/blog/${selectedArticleData.slug}`}
          structuredData={articleSchema}
        />
        
        <Header />

        <Navigation />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
              { name: language === 'es' ? 'Blog' : 'Blog', url: '/blog' },
              { name: selectedArticleData?.title || '', url: `/blog/${slug}` }
            ]}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cargando artículo...' : 'Loading article...'}
              </p>
            </div>
          ) : selectedArticleData ? (
          <>
          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <header className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                  {selectedArticleData.category}
                </span>
                {selectedArticleData.featured && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-semibold flex items-center gap-1">
                    ⭐ {language === 'es' ? 'Destacado' : 'Featured'}
                  </span>
                )}
                {selectedArticleData.readTime && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedArticleData.readTime}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedArticleData.date)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedArticleData.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                {selectedArticleData.excerpt}
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Por' : 'By'} <span className="font-semibold">{selectedArticleData.author}</span>
              </div>
              
              {/* Social Share */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <SocialShare
                  url={`https://boliviablue.com/blog/${selectedArticleData.slug}`}
                  title={selectedArticleData.title}
                  description={selectedArticleData.excerpt}
                />
              </div>
            </header>

            <div 
              className="blog-content
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h1]:mt-8 [&_h1]:mb-4
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-5 [&_h3]:mb-2
                [&_p]:text-base [&_p]:text-gray-700 [&_p]:dark:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
                [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:dark:text-white
                [&_ul]:list-disc [&_ul]:list-inside [&_ul]:text-gray-700 [&_ul]:dark:text-gray-300 [&_ul]:mb-4 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:text-gray-700 [&_ol]:dark:text-gray-300 [&_ol]:mb-4 [&_ol]:space-y-2
                [&_li]:ml-4 [&_li]:mb-1
                [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-700 [&_a]:dark:hover:text-blue-300
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:dark:border-blue-400 [&_blockquote]:bg-blue-50 [&_blockquote]:dark:bg-blue-900/20 [&_blockquote]:py-3 [&_blockquote]:px-4 [&_blockquote]:rounded-r [&_blockquote]:my-4 [&_blockquote]:italic
                [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:text-blue-600 [&_code]:dark:text-blue-400 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                [&_pre]:bg-gray-900 [&_pre]:dark:bg-gray-800 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                [&_img]:rounded-lg [&_img]:shadow-lg [&_img]:my-6 [&_img]:w-full [&_img]:h-auto
                [&_hr]:border-gray-300 [&_hr]:dark:border-gray-600 [&_hr]:my-6"
              dangerouslySetInnerHTML={{ __html: selectedArticleData.content }}
            />
          </article>

          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles
                .filter(a => a.id !== selectedArticleData.id && a.category === selectedArticleData.category)
                .slice(0, 2)
                .map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug || article.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-5 cursor-pointer group border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
          </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Artículo no encontrado' : 'Article not found'}
              </p>
              <Link
                to="/blog"
                className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === 'es' ? 'Volver al blog' : 'Back to blog'}
              </Link>
            </div>
          )}
        </main>

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

  // Featured articles (articles with featured: true)
  const featuredArticles = articles.filter(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' ? 'Blog - Guías y Análisis sobre Dólar Blue y Finanzas' : 'Blog - Guides and Analysis about Blue Dollar and Finance'}
        description={language === 'es'
          ? "Guías prácticas, análisis y estrategias sobre el dólar blue, USDT, Binance P2P y finanzas personales en Bolivia. Contenido actualizado y confiable."
          : "Practical guides, analysis and strategies about the blue dollar, USDT, Binance P2P and personal finance in Bolivia. Updated and reliable content."}
        keywords={language === 'es'
          ? "blog dólar blue, guía binance p2p, qué es usdt, estrategias financieras bolivia, proteger ahorros bolivia, historia dólar blue, análisis económico bolivia"
          : "blue dollar blog, binance p2p guide, what is usdt, financial strategies bolivia, protect savings bolivia, blue dollar history, economic analysis bolivia"}
        canonical="/blog"
        structuredData={blogSchema}
      />
      
      <Header />

      <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rate Cards */}
        <section className="mb-8">
          <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        </section>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'Blog' : 'Blog'}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {language === 'es' 
              ? 'Guías prácticas, análisis y estrategias para navegar el mercado cambiario boliviano'
              : 'Practical guides, analysis and strategies to navigate the Bolivian currency market'}
          </p>
        </div>

        {/* Binance Banner */}
        <div className="mb-12">
          <BinanceBanner />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'Cargando artículos...' : 'Loading articles...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {language === 'es' 
                ? 'No se pudieron cargar los artículos desde Supabase. Mostrando artículos locales.'
                : 'Could not load articles from Supabase. Showing local articles.'}
            </p>
          </div>
        )}

        {/* Featured Articles */}
        {!isLoading && featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              ⭐ {language === 'es' ? 'Artículos Destacados' : 'Featured Articles'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug || article.id}`}
                  className="block bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 cursor-pointer group border-2 border-blue-200 dark:border-blue-800"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                    {article.readTime && (
                      <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {article.readTime}
                      </span>
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {formatDate(article.date)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-200 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {article.author}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                      {language === 'es' ? 'Leer guía' : 'Read guide'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {!isLoading && regularArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? 'Todos los Artículos' : 'All Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug || article.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer group"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                      {article.category}
                    </span>
                    {article.readTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.date)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {article.author}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                      {language === 'es' ? 'Leer más →' : 'Read more →'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

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

export default Blog;
