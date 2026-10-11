import { useEffect, useRef, useState } from 'react';
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

const IFRAME_SNIPPET = `<iframe src="${SITE_URL}/embed.html" title="Dólar blue Bolivia" width="360" height="300" loading="lazy" style="border:0;max-width:100%"></iframe>
<p>Fuente: <a href="${SITE_URL}/dolar-blue-hoy">Bolivia Blue</a></p>`;

const BADGE_SNIPPET = `<a href="${SITE_URL}/dolar-blue-hoy?utm_source=badge" rel="noopener"><img src="${SITE_URL}/api/badge.svg" alt="Dólar blue Bolivia — Bolivia Blue" width="320" height="40" /></a>`;

function EmbedPreview({ language }) {
  const targetRef = useRef(null);
  useEffect(() => {
    const target = targetRef.current;
    const s = document.createElement('script');
    s.src = '/embed.js';
    s.async = true;
    s.setAttribute('data-target', target.id);
    s.setAttribute('data-lang', language);
    document.body.appendChild(s);
    return () => {
      s.remove();
      window.BoliviaBlueWidget?.unmount(target);
    };
  }, [language]);
  return <div ref={targetRef} id="bolivia-blue-widget-preview" />;
}

function Widget() {
  useAdsenseReady();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [copied, setCopied] = useState('');
  const paymentLanguage = language === 'en' ? 'en' : 'es';
  const paymentGuide = paymentLanguage === 'en' ? '/bolivia-money-guide' : '/guia-dinero-bolivia';
  const paymentTitle = paymentLanguage === 'en' ? 'Compare paying in BOB or USD — Bolivia Blue' : 'Comparar pagos en BOB o USD — Bolivia Blue';
  const paymentSrc = `/embed.html?mode=payment-cost&lang=${paymentLanguage}`;
  const paymentSnippet = `<iframe src="${SITE_URL}/embed.html?mode=payment-cost&amp;lang=${paymentLanguage}" title="${paymentTitle}" width="100%" height="900" loading="lazy" style="border:0;max-width:100%"></iframe>
<p><a href="${SITE_URL}${paymentGuide}#payment-cost-comparison">${paymentLanguage === 'en' ? 'Payment-cost checker by Bolivia Blue' : 'Comparador de pagos de Bolivia Blue'}</a></p>`;

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied(`${key}-error`);
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
            ? 'Publica la referencia P2P USDT/BOB en tu web o blog. Widget gratis con hora de Bolivia, estado de la lectura y enlace a boliviablue.com.'
            : 'Publish the P2P USDT/BOB reference on your site or blog. Free widget with Bolivia time, observation status and a link to boliviablue.com.'
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
              ? 'Referencia P2P USDT/BOB para medios y blogs, con fecha, hora de Bolivia y enlace de atribución. Consulta nuevas lecturas cada minuto; no representa dólares en efectivo ni el tipo oficial del BCB.'
              : 'P2P USDT/BOB reference for media and blogs, with a date, Bolivia time and attribution link. Checks for new observations every minute; it does not represent cash dollars or the BCB official rate.'}
          </p>
          <p className="text-sm">
            <a href="#payment-cost" className="inline-flex min-h-[44px] items-center text-blue-600 dark:text-blue-300 underline">
              {language === 'es' ? '¿Tu página explica cómo pagar un hotel o tour? Agregá el comparador BOB/USD ↓' : 'Does your page explain paying for a hotel or tour? Add the BOB/USD cost checker ↓'}
            </a>
          </p>
        </header>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'es' ? 'Vista previa' : 'Preview'}
          </h2>
          <EmbedPreview language={language} />
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

        <section id="payment-cost" className="min-w-0 scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] space-y-4" aria-labelledby="payment-embed-title">
          <h2 id="payment-embed-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? '5. Comparador de costos para viajeros' : '5. Payment-cost checker for travelers'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'es'
              ? 'Para guías de viaje, hoteles y operadores turísticos: dejá que tus lectores comparen dos precios de la misma compra con la tasa y las comisiones que realmente pueden usar. Comienza sin precios ni tasa; no toma la referencia P2P del recuadro anterior.'
              : 'For travel guides, hotels and tour operators: let readers compare two prices for the same purchase using the rate and fees they can actually use. Prices and rate start blank; it does not use the P2P reference in the box above.'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {language === 'es'
              ? 'Los cálculos quedan en el navegador. El comparador no guarda ni envía los datos ingresados, no obtiene cotizaciones de efectivo o tarjetas y no garantiza ahorros. Cada comercio debe confirmar los métodos aceptados y sus precios.'
              : 'Calculations stay in the browser. The checker does not save or send entered values, obtain cash or card quotes, or guarantee savings. Each merchant must confirm accepted payment methods and prices.'}
          </p>
          <iframe src={paymentSrc} title={paymentTitle} width="100%" height="900" loading="lazy" className="max-w-full rounded-xl border border-gray-300 dark:border-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {language === 'es' ? 'Podés desplazarte dentro del recuadro para ver todos los campos y resultados. ' : 'Scroll inside the box to reach all fields and results. '}
            <a href={`${SITE_URL}${paymentGuide}#payment-cost-comparison`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-blue-600 dark:text-blue-300 underline">
              {language === 'es' ? 'Abrir el comparador en la guía ↗' : 'Open the checker in the guide ↗'}
            </a>
          </p>
          <label htmlFor="payment-embed-code" className="block font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Código iframe para tu página' : 'Iframe code for your page'}
          </label>
          <textarea id="payment-embed-code" readOnly value={paymentSnippet} rows={6} onFocus={(event) => event.target.select()} className="w-full min-w-0 rounded-lg border border-gray-400 bg-gray-900 p-4 font-mono text-sm text-gray-100" aria-describedby="payment-embed-instructions" />
          <p id="payment-embed-instructions" className="text-sm text-gray-600 dark:text-gray-300">
            {language === 'es'
              ? 'Pegá el código en un bloque HTML de tu CMS si admite iframes. Usá lang=es o lang=en y agregá &theme=dark si querés el tema oscuro. El ancho se adapta; podés aumentar la altura. Conservá el desplazamiento y el enlace de atribución. Si tu CMS bloquea iframes, enlazá al comparador en la guía.'
              : 'Paste the code into a CMS HTML block if it allows iframes. Use lang=es or lang=en and add &theme=dark for dark mode. Width adapts; you can increase the height. Keep scrolling enabled and preserve the attribution link. If your CMS blocks iframes, link to the checker in the guide.'}
          </p>
          <button type="button" onClick={() => copy(paymentSnippet, 'payment')} className="min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600">
            {copied === 'payment' ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar comparador' : 'Copy checker code')}
          </button>
          <p role="status" aria-live="polite" className="text-sm text-gray-700 dark:text-gray-300">
            {copied === 'payment' ? (language === 'es' ? 'Código copiado.' : 'Code copied.') : copied === 'payment-error' ? (language === 'es' ? 'No se pudo copiar automáticamente. Seleccioná el código de arriba y copialo manualmente.' : 'Automatic copying failed. Select the code above and copy it manually.') : ''}
          </p>
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
