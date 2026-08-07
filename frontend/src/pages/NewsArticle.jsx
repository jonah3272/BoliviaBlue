import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import RateTrioStrip from '../components/RateTrioStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchBlueRate, fetchNewsById } from '../utils/api';
import { cleanSummary, cleanTitle, formatDateTime } from '../utils/formatters';
import { newsIdFromSlugParam, newsArticlePath } from '../utils/newsSlug';
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';
import { blockAdsOnThisPage } from '../utils/adsenseLoader';

export default function NewsArticle() {
  const { slugParam } = useParams();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const es = language === 'es';
  const [article, setArticle] = useState(null);
  const [rate, setRate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blockAdsOnThisPage();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const id = newsIdFromSlugParam(slugParam);
        if (!id) throw new Error(es ? 'Noticia no encontrada' : 'Article not found');
        const [item, rateData] = await Promise.all([
          fetchNewsById(id),
          fetchBlueRate().catch(() => null),
        ]);
        if (cancelled) return;
        if (!item) throw new Error(es ? 'Noticia no encontrada' : 'Article not found');
        setArticle(item);
        setRate(rateData);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugParam, es]);

  const title = article ? cleanTitle(article.title) : es ? 'Noticia' : 'News';
  const summary = article ? cleanSummary(article.summary || '') : '';
  const path = article ? newsArticlePath(article) : '/noticias';
  const buy = rate?.buy ?? rate?.buy_bob_per_usd;
  const sell = rate?.sell ?? rate?.sell_bob_per_usd;

  const schemas = article
    ? [
        getWebPage({
          name: title,
          description: summary || title,
          url: path,
          dateModified: article.published_at_iso,
          inLanguage: es ? 'es-BO' : 'en-US',
        }),
        getBreadcrumbList([
          { name: es ? 'Inicio' : 'Home', url: '/' },
          { name: es ? 'Noticias' : 'News', url: '/noticias' },
          { name: title, url: path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: title,
          description: summary || title,
          datePublished: article.published_at_iso,
          dateModified: article.published_at_iso,
          author: { '@type': 'Organization', name: article.source || 'Bolivia Blue con Paz' },
          publisher: {
            '@type': 'Organization',
            name: 'Bolivia Blue con Paz',
            url: 'https://boliviablue.com',
          },
          mainEntityOfPage: `https://boliviablue.com${path}`,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={`${title} | ${es ? 'Noticias' : 'News'} – Bolivia Blue`}
        description={
          summary ||
          (es
            ? 'Noticia económica de Bolivia y contexto del dólar blue / paralelo.'
            : 'Bolivia economic news with blue / parallel dollar context.')
        }
        canonical={path}
        structuredData={schemas}
      />
      <Header />
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: es ? 'Inicio' : 'Home', path: '/' },
            { label: es ? 'Noticias' : 'News', path: '/noticias' },
            { label: title },
          ]}
        />

        {loading && (
          <p className="text-gray-500 dark:text-gray-400">{es ? 'Cargando…' : 'Loading…'}</p>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-4 text-rose-700 dark:text-rose-300">
            {error}{' '}
            <Link to="/noticias" className="underline font-semibold">
              {es ? 'Volver a noticias' : 'Back to news'}
            </Link>
          </div>
        )}

        {article && !loading && (
          <article className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {article.source || 'Bolivia'}
              {article.published_at_iso && (
                <> · {formatDateTime(article.published_at_iso)}</>
              )}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            {summary && (
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            )}
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {es ? 'Leer fuente original' : 'Read original source'} →
              </a>
            )}

            <div className="pt-4">
              <RateTrioStrip
                buy={buy}
                sell={sell}
                officialBuy={rate?.official_buy}
                officialSell={rate?.official_sell}
                language={language}
                updatedAt={rate?.updated_at_iso}
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {es
                ? 'Contexto: el dólar blue (paralelo) en Bolivia se actualiza aquí cada pocos minutos desde Binance P2P.'
                : 'Context: Bolivia’s blue (parallel) dollar is updated here every few minutes from Binance P2P.'}{' '}
              <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {es ? 'Ver cotización de hoy' : 'See today’s quote'}
              </Link>
            </p>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
