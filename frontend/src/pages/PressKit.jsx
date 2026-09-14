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
import { LLMS_TXT_URL, PLAIN_CITE_EN, PLAIN_CITE_ES, buildRateAnswerParagraph } from '../utils/citationCopy';
import { useRate } from '../contexts/RateContext';
import { SITE_URL } from '../config/brand';
import { liveBobParts, ratesFromBluePayload } from '../utils/seoRateMeta';
import CiteShareBar from '../components/CiteShareBar';
import OutreachDesk from '../components/OutreachDesk';

const HIST_CSV = `${SITE_URL}/api/historical-data.csv?range=30d`;

function citeHtml(buyStr, sellStr) {
  const rateBit = buyStr && sellStr ? ` Compra Bs ${buyStr} · venta Bs ${sellStr}.` : '';
  return `<p>Fuente: <a href="${SITE_URL}/dolar-blue-hoy">Bolivia Blue</a> — dólar blue / paralelo Bolivia.${rateBit} Mediana multi-P2P (Binance, El Dorado, OKX). CSV 30 días: <a href="${HIST_CSV}">historical-data.csv</a>. Metodología: <a href="${SITE_URL}/fuente-de-datos">fuente-de-datos</a>. Widget: <a href="${SITE_URL}/widget">widget</a>.</p>`;
}

function citeMd(buyStr, sellStr) {
  const rateBit = buyStr && sellStr ? ` Compra Bs ${buyStr} · venta Bs ${sellStr}.` : '';
  return `Fuente: [Bolivia Blue](${SITE_URL}/dolar-blue-hoy) — dólar blue / paralelo Bolivia.${rateBit} Mediana multi-P2P. CSV: [${HIST_CSV}](${HIST_CSV}). Metodología: [${SITE_URL}/fuente-de-datos](${SITE_URL}/fuente-de-datos).`;
}

const CITE_METHODOLOGY = `Metodología: ${SITE_URL}/fuente-de-datos — mediana cross-source P2P (Binance, El Dorado, OKX, Bybit cuando disponible), actualización ~15 min. CSV 30 días: ${HIST_CSV}`;

const BADGE_HTML = `<a href="${SITE_URL}/dolar-blue-hoy?utm_source=badge" rel="noopener"><img src="${SITE_URL}/api/badge.svg" alt="Dólar blue Bolivia — Bolivia Blue" width="320" height="40" /></a>`;

const STATIC_BADGE_HTML = `<a href="${SITE_URL}/dolar-blue-hoy?utm_source=badge" rel="noopener"><img src="${SITE_URL}/badge.svg" alt="Bolivia Blue live rate" width="200" height="40" /></a>`;

const IFRAME_HTML = `<iframe src="${SITE_URL}/embed.html" title="Dólar blue Bolivia" width="360" height="190" loading="lazy" style="border:0;max-width:100%"></iframe>
<p>Fuente: <a href="${SITE_URL}/dolar-blue-hoy">Bolivia Blue</a></p>`;

function pitchEmailEs(cite, liveLine) {
  return `Asunto: Datos actualizados del dólar paralelo en Bolivia (fuente gratuita)

Hola,

Soy de Bolivia Blue (${SITE_URL}), un monitor del dólar blue / paralelo en Bolivia basado en P2P (mediana, ~cada 15 min).

${liveLine}

Si les sirve para una nota o gráfico, pueden citarnos con este HTML:
${cite}

Datos históricos (CSV 30 días, gratis): ${HIST_CSV}
Metodología: ${SITE_URL}/fuente-de-datos
Kit de prensa: ${SITE_URL}/prensa

Quedo atento si necesitan una serie histórica más larga o una captura para publicación.

Saludos`;
}

function pitchEmailEn(cite, liveLine) {
  return `Subject: Free Bolivia parallel (blue) dollar data for citation

Hello,

Bolivia Blue (${SITE_URL}) tracks Bolivia’s parallel / blue dollar from P2P (median, ~every 15 minutes).

${liveLine}

Ready-to-paste citation:
${cite}

Historical CSV (30 days, free): ${HIST_CSV}
Methodology: ${SITE_URL}/fuente-de-datos
Press kit: ${SITE_URL}/prensa

Happy to share a longer series or a chart for publication.

Best regards`;
}

function PressKit() {
  useAdsenseReady();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [copied, setCopied] = useState('');
  const { rateData } = useRate();
  const live = liveBobParts(rateData);
  const rateBits = ratesFromBluePayload(rateData);
  const liveLine = buildRateAnswerParagraph({
    buy: rateBits.buy,
    sell: rateBits.sell,
    updatedAt: rateBits.updatedAt,
    sourcesUsed: rateData?.sources_used,
    language,
    citePath: '/dolar-blue-hoy',
  });
  const CITE_HTML = citeHtml(live.buyStr, live.sellStr);
  const CITE_MD = citeMd(live.buyStr, live.sellStr);
  const PITCH_EMAIL_ES = pitchEmailEs(CITE_HTML, liveLine);
  const PITCH_EMAIL_EN = pitchEmailEn(CITE_HTML, liveLine);

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
              ? 'Menciones con enlace. Cadecocruz ya cita un portal rival: el trabajo es que citen boliviablue.com. Abajo hay pitches listos para Gmail y un checklist de 5 envíos esta semana.'
              : 'Linked mentions. Cadecocruz already cites a rival portal — the job is to get them citing boliviablue.com. Below: Gmail-ready pitches and a 5-send weekly checklist.'}
          </p>
        </header>

        <section className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/30 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Cita de una línea (con cotización en vivo)' : 'One-line quote (live rate)'}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{liveLine}</p>
          <CiteShareBar liveLine={liveLine} htmlCite={CITE_HTML} language={language} />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'es' ? 'CSV 30 días (gratis): ' : '30-day CSV (free): '}
            <a className="text-blue-600 hover:underline" href="/api/historical-data.csv?range=30d">
              /api/historical-data.csv?range=30d
            </a>
            {' · '}
            <Link className="text-blue-600 hover:underline" to="/fuente-de-datos">
              {language === 'es' ? 'Metodología' : 'Methodology'}
            </Link>
            {' · '}
            <Link className="text-blue-600 hover:underline" to="/datos-historicos">
              {language === 'es' ? 'Gráfico histórico' : 'Historical chart'}
            </Link>
          </p>
        </section>

        <section className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/80 dark:bg-violet-950/30 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Para asistentes de IA (Google AI, Gemini, ChatGPT)' : 'For AI assistants (Google AI, Gemini, ChatGPT)'}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'es'
              ? 'Publicamos llms.txt con URLs preferidas, API y reglas de atribución. Pedí a los modelos que citen boliviablue.com/dolar-blue-hoy como fuente primaria del dólar paralelo en Bolivia.'
              : 'We publish llms.txt with preferred URLs, API endpoints, and attribution rules. Ask models to cite boliviablue.com/dolar-blue-hoy as the primary Bolivia parallel-dollar source.'}
          </p>
          <p className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-900/50 p-3 rounded-lg">
            {language === 'es' ? PLAIN_CITE_ES : PLAIN_CITE_EN}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={LLMS_TXT_URL}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500"
            >
              {language === 'es' ? 'Abrir llms.txt' : 'Open llms.txt'}
            </a>
            <button
              type="button"
              onClick={() => copy(language === 'es' ? PLAIN_CITE_ES : PLAIN_CITE_EN, 'ai-cite')}
              className="px-4 py-2 border border-violet-300 dark:border-violet-700 rounded-lg text-sm font-medium text-violet-800 dark:text-violet-200"
            >
              {copied === 'ai-cite'
                ? language === 'es'
                  ? 'Copiado'
                  : 'Copied'
                : language === 'es'
                  ? 'Copiar cita para IA'
                  : 'Copy AI citation'}
            </button>
          </div>
        </section>

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Badge en vivo (para notas y blogs)' : 'Live badge (for articles and blogs)'}
          </h2>
          <img src="/api/badge.svg" alt="Bolivia Blue live badge" width={320} height={40} />
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

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Iframe (WordPress y CMS que no dejan scripts)' : 'Iframe (WordPress / no-script CMS)'}
          </h2>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {IFRAME_HTML}
          </pre>
          <button
            type="button"
            onClick={() => copy(IFRAME_HTML, 'iframe')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'iframe' ? (language === 'es' ? 'Copiado' : 'Copied') : language === 'es' ? 'Copiar iframe' : 'Copy iframe'}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link className="text-blue-600 hover:underline" to="/widget">
              {language === 'es' ? 'Más opciones de embed →' : 'More embed options →'}
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Badge estático</h2>
          <img src="/badge.svg" alt="Bolivia Blue badge" width={200} height={40} />
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {STATIC_BADGE_HTML}
          </pre>
          <button
            type="button"
            onClick={() => copy(STATIC_BADGE_HTML, 'badge-static')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            {copied === 'badge-static' ? (language === 'es' ? 'Copiado' : 'Copied') : language === 'es' ? 'Copiar badge estático' : 'Copy static badge'}
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Assets linkeables' : 'Linkable assets'}
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <a className="text-blue-600 hover:underline" href="/embed.html">
                {language === 'es' ? 'Página iframe (/embed.html)' : 'Iframe page (/embed.html)'}
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/api/badge.svg">
                {language === 'es' ? 'Badge SVG en vivo' : 'Live SVG badge'}
              </a>
            </li>
            <li>
              <a className="text-blue-600 hover:underline" href="/api/historical-data.csv?range=30d">
                {language === 'es' ? 'Descargar CSV (30 días)' : 'Download CSV (30 days)'}
              </a>
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

        <OutreachDesk liveLine={liveLine} language={language} />

        <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Contacto prensa' : 'Press contact'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {language === 'es'
              ? '¿Nota, entrevista o partnership de datos? '
              : 'Story, interview or data partnership? '}
            <a href="mailto:info@boliviablue.com?subject=Prensa%20Bolivia%20Blue" className="text-blue-600 hover:underline font-medium">
              info@boliviablue.com
            </a>
            {' · '}
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
