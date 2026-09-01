import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getWebPage, getBreadcrumbList } from '../utils/seoSchema';

const CITE_HTML = `<p>Fuente: <a href="https://boliviablue.com/dolar-blue-hoy">Bolivia Blue</a> — dólar blue / paralelo Bolivia (lectura verificada, mediana multi-P2P: Binance, El Dorado, OKX). Histórico: <a href="https://boliviablue.com/datos-historicos">datos-historicos</a>. Widget: <a href="https://boliviablue.com/widget">boliviablue.com/widget</a>.</p>`;

const CITE_MD = `Fuente: [Bolivia Blue](https://boliviablue.com/dolar-blue-hoy) — dólar blue / paralelo Bolivia (mediana multi-P2P). Histórico: [datos-historicos](https://boliviablue.com/datos-historicos). Widget: [boliviablue.com/widget](https://boliviablue.com/widget).`;

const CITE_METHODOLOGY = `Metodología: https://boliviablue.com/fuente-de-datos — mediana cross-source P2P (Binance, El Dorado, OKX, Bybit cuando disponible), actualización ~15 min.`;

const BADGE_HTML = `<a href="https://boliviablue.com/?utm_source=badge" rel="noopener"><img src="https://boliviablue.com/badge.svg" alt="Bolivia Blue live rate" width="200" height="40" /></a>`;

const PITCH_EMAIL_ES = `Asunto: Datos actualizados del dólar paralelo en Bolivia (fuente gratuita)

Hola,

Soy de Bolivia Blue (https://boliviablue.com), un monitor del dólar blue / paralelo en Bolivia basado en Binance P2P (mediana, ~cada 15 min).

Si les sirve para una nota o gráfico, pueden citarnos con este HTML:
${CITE_HTML}

Datos históricos (CSV 30 días, gratis): https://boliviablue.com/datos-historicos
Metodología: https://boliviablue.com/fuente-de-datos
Kit de prensa: https://boliviablue.com/prensa

Quedo atento si necesitan una serie histórica más larga o una captura para publicación.

Saludos`;

const PITCH_EMAIL_EN = `Subject: Free Bolivia parallel (blue) dollar data for citation

Hello,

Bolivia Blue (https://boliviablue.com) tracks Bolivia’s parallel / blue dollar from Binance P2P (median, ~every 15 minutes).

Ready-to-paste citation:
${CITE_HTML}

Historical CSV (30 days, free): https://boliviablue.com/datos-historicos
Methodology: https://boliviablue.com/fuente-de-datos
Press kit: https://boliviablue.com/prensa

Happy to share a longer series or a chart for publication.

Best regards`;

const OUTREACH = [
  {
    es: 'Red Uno / Unitel / ATB: ofrece “cierre del paralelo hoy + gráfico” con atribución a boliviablue.com (ya citan portales similares).',
    en: 'National TV/news: offer “today’s parallel close + chart” attributed to boliviablue.com.'
  },
  {
    es: 'Radio Fides / Erbol / RTP: pitch semanal de 30s con la cotización blue vs BCB y link a /dolar-blue-hoy.',
    en: 'Radio networks: weekly 30s pitch with blue vs BCB and link to /dolar-blue-hoy.'
  },
  {
    es: 'Medios bolivianos (El Deber, Los Tiempos, Opinión, Página Siete, La Razón, Eju): ofrece “datos + gráfico + atribución” para notas de economía.',
    en: 'Bolivian media: offer “data + chart + attribution” for economy stories.'
  },
  {
    es: 'Grupos de Telegram / WhatsApp de dólares y USDT: comparte el widget o el link diario /dolar-blue-hoy con la cotización.',
    en: 'Telegram / WhatsApp dollar & USDT groups: share the widget or daily /dolar-blue-hoy link.'
  },
  {
    es: 'YouTubers / TikTok / Instagram Reels de finanzas en Bolivia: kit de prensa + piden “fuente boliviablue.com” en descripción.',
    en: 'Finance creators (YT/TikTok/Reels): press kit + ask for boliviablue.com in the description.'
  },
  {
    es: 'Universidades (UMSA, UAGRM, UMSS) / tesis de economía: CSV histórico gratis a cambio de cita (página datos históricos).',
    en: 'Universities / theses: free historical CSV in exchange for a citation.'
  },
  {
    es: 'Directorios y “mejores tools”: Product Hunt alternatives, listas de APIs LatAm, Awesome lists en GitHub, directorios de fintech Bolivia.',
    en: 'Directories: LatAm API lists, GitHub awesome lists, Bolivia fintech roundups.'
  },
  {
    es: 'Guest posts / columnas: “Cómo leer el dólar paralelo en Bolivia” con enlace a metodología + widget + /prensa.',
    en: 'Guest posts: “How to read Bolivia’s parallel dollar” linking methodology + widget + /prensa.'
  },
  {
    es: 'Newsletters económicas y blogs de análisis (LatAm FX): ofrece embed del widget o CSV semanal con atribución.',
    en: 'Economy newsletters / LatAm FX blogs: offer widget embed or weekly CSV with attribution.'
  }
];

function PressKit() {
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
    name: language === 'es' ? 'Kit de prensa Bolivia Blue' : 'Bolivia Blue press kit',
    description:
      language === 'es'
        ? 'Logos, badges, citas HTML y assets para periodistas y creadores que cubren el dólar blue en Bolivia.'
        : 'Logos, badges, HTML citations and assets for journalists covering Bolivia’s blue dollar.',
    url: '/prensa',
    inLanguage: language === 'es' ? 'es-BO' : 'en-US'
  });

  const crumbs = getBreadcrumbList([
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Prensa' : 'Press', url: '/prensa' }
  ]);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={
          language === 'es'
            ? 'Prensa Bolivia Blue | Kit de medios, citas y datos'
            : 'Bolivia Blue Press | Media kit, citations & data'
        }
        description={
          language === 'es'
            ? 'Recursos gratis para periodistas: cómo citar el dólar blue, badge SVG, widget embed, CSV histórico y metodología. Contacto para entrevistas.'
            : 'Free journalist resources: how to cite the blue dollar, SVG badge, embed widget, historical CSV and methodology.'
        }
        keywords="kit prensa dólar blue, citar cotización bolivia, badge bolivia blue, datos para medios bolivia"
        canonical="/prensa"
        structuredData={[webPage, crumbs]}
      />
      <Header />
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Prensa' : 'Press', url: '/prensa' }
          ]}
        />

        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {language === 'es' ? 'Kit de prensa y backlinks' : 'Press kit & backlinks'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {language === 'es'
              ? 'Para ser #1 no basta el on-page: necesitás menciones con enlace. Acá está todo lo que un medio o creador necesita para citarte en 30 segundos.'
              : 'To win #1 you need linked mentions. Everything a journalist or creator needs to cite you in 30 seconds.'}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Email listo para enviar' : 'Ready-to-send pitch email'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es'
              ? 'Copiá y mandalo a redacción de economía (El Deber, Los Tiempos, Opinión, Eju, etc.).'
              : 'Copy and send to economy desks.'}
          </p>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {language === 'es' ? PITCH_EMAIL_ES : PITCH_EMAIL_EN}
          </pre>
          <button
            type="button"
            onClick={() => copy(language === 'es' ? PITCH_EMAIL_ES : PITCH_EMAIL_EN, 'pitch')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'pitch'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar email'
                : 'Copy email'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Cita lista (HTML)' : 'Ready citation (HTML)'}
          </h2>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {CITE_HTML}
          </pre>
          <button
            type="button"
            onClick={() => copy(CITE_HTML, 'html')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'html' ? (language === 'es' ? 'Copiado' : 'Copied') : language === 'es' ? 'Copiar' : 'Copy'}
          </button>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap mt-4">
            {CITE_MD}
          </pre>
          <button
            type="button"
            onClick={() => copy(CITE_MD, 'md')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'md' ? (language === 'es' ? 'Copiado' : 'Copied') : 'Markdown'}
          </button>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap mt-4">
            {CITE_METHODOLOGY}
          </pre>
          <button
            type="button"
            onClick={() => copy(CITE_METHODOLOGY, 'method')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'method'
              ? language === 'es'
                ? 'Copiado'
                : 'Copied'
              : language === 'es'
                ? 'Copiar metodología'
                : 'Copy methodology'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Badge</h2>
          <img src="/badge.svg" alt="Bolivia Blue badge" width={200} height={40} />
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {BADGE_HTML}
          </pre>
          <button
            type="button"
            onClick={() => copy(BADGE_HTML, 'badge')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'badge' ? (language === 'es' ? 'Copiado' : 'Copied') : language === 'es' ? 'Copiar badge' : 'Copy badge'}
          </button>
        </section>

        <section className="space-y-2 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Assets linkeables' : 'Linkable assets'}
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Link className="text-blue-600 hover:underline" to="/widget">
                Widget embed
              </Link>
            </li>
            <li>
              <Link className="text-blue-600 hover:underline" to="/datos-historicos">
                {language === 'es' ? 'CSV / JSON histórico' : 'Historical CSV / JSON'}
              </Link>
            </li>
            <li>
              <Link className="text-blue-600 hover:underline" to="/fuente-de-datos">
                {language === 'es' ? 'Metodología' : 'Methodology'}
              </Link>
            </li>
            <li>
              <Link className="text-blue-600 hover:underline" to="/api-docs">
                API
              </Link>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/blog/rss.xml">
                Blog RSS
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/noticias/rss.xml">
                {language === 'es' ? 'Noticias RSS' : 'News RSS'}
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/llms.txt">
                llms.txt
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Plan de backlinks (hacé esto esta semana)' : 'Backlink plan (do this week)'}
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            {OUTREACH.map((item, i) => (
              <li key={i}>{language === 'es' ? item.es : item.en}</li>
            ))}
          </ol>
        </section>

        <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Contacto prensa' : 'Press contact'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'es'
              ? '¿Nota, entrevista o partnership de datos? '
              : 'Story, interview or data partnership? '}
            <Link to="/contacto" className="text-blue-600 hover:underline font-medium">
              {language === 'es' ? 'Escribinos' : 'Contact us'}
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PressKit;
