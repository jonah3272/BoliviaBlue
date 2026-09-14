import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';
import { SITE_URL } from '../config/brand';

const EMBED_SNIPPET = `<div id="bolivia-blue-widget"></div>
<script src="${SITE_URL}/embed.js" async></script>`;

const EMBED_DARK = `<div id="bolivia-blue-widget"></div>
<script src="${SITE_URL}/embed.js" data-theme="dark" data-lang="es" async></script>`;

const IFRAME_SNIPPET = `<iframe src="${SITE_URL}/embed.html" title="Dólar blue Bolivia" width="360" height="190" loading="lazy" style="border:0;max-width:100%"></iframe>
<p>Fuente: <a href="${SITE_URL}/dolar-blue-hoy">Bolivia Blue</a></p>`;

const BADGE_SNIPPET = `<a href="${SITE_URL}/dolar-blue-hoy?utm_source=badge" rel="noopener"><img src="${SITE_URL}/api/badge.svg" alt="Dólar blue Bolivia — Bolivia Blue" width="320" height="40" /></a>`;

function EmbedPreview() {
  useEffect(() => {
    if (document.getElementById('bb-embed-preview-script')) return;
    const s = document.createElement('script');
    s.id = 'bb-embed-preview-script';
    s.src = '/embed.js';
    s.async = true;
    s.setAttribute('data-target', 'bolivia-blue-widget-preview');
    s.setAttribute('data-lang', 'es');
    document.body.appendChild(s);
  }, []);
  return <div id="bolivia-blue-widget-preview" />;
}

function Widget() {
  useAdsenseReady();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [copied, setCopied] = useState('');

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* ignore */
    }
  };

  const webPage = getWebPage({
    name: language === 'es' ? 'Widget gratuito dólar blue Bolivia' : 'Free Bolivia blue dollar widget',
    description:
      language === 'es'
        ? 'Embed gratuito de la cotización del dólar blue en Bolivia. Copia el código y enlaza a boliviablue.com.'
        : 'Free embed of the Bolivia blue dollar rate. Copy the code and link back to boliviablue.com.',
    url: '/widget',
    inLanguage: language === 'es' ? 'es-BO' : 'en-US'
  });

  const crumbs = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: 'Widget', url: '/widget' }
  ]);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={
          language === 'es'
            ? 'Widget Gratuito Dólar Blue Bolivia | Embed en tu Sitio'
            : 'Free Bolivia Blue Dollar Widget | Embed on Your Site'
        }
        description={
          language === 'es'
            ? 'Pon la cotización del dólar blue en vivo en tu web o blog. Widget gratis, actualizado cada 15 min. Solo pide un enlace a boliviablue.com.'
            : 'Put the live Bolivia blue dollar rate on your site or blog. Free widget, updated every 15 min. Just link back to boliviablue.com.'
        }
        keywords="widget dólar blue bolivia, embed cotización dólar bolivia, api dólar paralelo, badge bolivia blue"
        canonical="/widget"
        structuredData={[webPage, crumbs]}
      />
      <Header />
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: 'Widget', url: '/widget' }
          ]}
        />

        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {language === 'es'
              ? 'Widget gratuito: dólar blue en tu sitio'
              : 'Free widget: blue dollar on your site'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {language === 'es'
              ? 'Herramienta lista para medios, blogs y canales: cotización en vivo + enlace de atribución a boliviablue.com (así ganas menciones y tráfico).'
              : 'Ready for media, blogs and channels: live quote + attribution link to boliviablue.com (mentions and traffic).'}
          </p>
        </header>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'Vista previa' : 'Preview'}
          </h2>
          <EmbedPreview />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? '1. Código básico' : '1. Basic code'}
          </h2>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {EMBED_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={() => copy(EMBED_SNIPPET, 'basic')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {copied === 'basic'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar código'
                : 'Copy code'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? '2. Tema oscuro' : '2. Dark theme'}
          </h2>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {EMBED_DARK}
          </pre>
          <button
            type="button"
            onClick={() => copy(EMBED_DARK, 'dark')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {copied === 'dark'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar código'
                : 'Copy code'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? '3. Iframe (WordPress / CMS)' : '3. Iframe (WordPress / CMS)'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es'
              ? 'Si tu CMS no deja pegar scripts, usá este iframe. El recuadro incluye un enlace a Bolivia Blue.'
              : 'If your CMS blocks scripts, use this iframe. The box includes a link to Bolivia Blue.'}
          </p>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {IFRAME_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={() => copy(IFRAME_SNIPPET, 'iframe')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {copied === 'iframe'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar iframe'
                : 'Copy iframe'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? '4. Badge SVG en vivo' : '4. Live SVG badge'}
          </h2>
          <img src="/api/badge.svg" alt="Bolivia Blue live badge" width={320} height={40} />
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {BADGE_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={() => copy(BADGE_SNIPPET, 'badge')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {copied === 'badge'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar badge'
                : 'Copy badge'}
          </button>
        </section>

        <section className="text-gray-700 dark:text-gray-300 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Reglas de uso' : 'Usage rules'}
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {language === 'es'
                ? 'Gratis para blogs, medios y landings.'
                : 'Free for blogs, media and landings.'}
            </li>
            <li>
              {language === 'es'
                ? 'No quites el enlace a boliviablue.com.'
                : 'Do not remove the boliviablue.com link.'}
            </li>
            <li>
              {language === 'es'
                ? 'Uso comercial masivo: contacta primero.'
                : 'Large commercial use: contact us first.'}
            </li>
          </ul>
          <p>
            <Link to="/prensa" className="text-blue-600 hover:underline">
              {language === 'es' ? 'Kit de prensa →' : 'Press kit →'}
            </Link>{' '}
            ·{' '}
            <Link to="/api-docs" className="text-blue-600 hover:underline">
              API
            </Link>{' '}
            ·{' '}
            <Link to="/fuente-de-datos" className="text-blue-600 hover:underline">
              {language === 'es' ? 'Metodología' : 'Methodology'}
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Widget;
