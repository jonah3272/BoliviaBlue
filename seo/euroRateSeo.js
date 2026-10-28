import { validObservationTime } from '../frontend/src/utils/observationTime.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const PATH = '/euro-a-boliviano';
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const validRate = value => typeof value === 'number' && Number.isFinite(value) && value >= 1;

/** EUR can be carried forward independently of USD. Never borrow the USD timestamp. */
export function euroRateModel(rate, now = Date.now()) {
  const observedAt = validObservationTime(rate?.eur_updated_at_iso);
  const available = validRate(rate?.buy_bob_per_eur) && validRate(rate?.sell_bob_per_eur)
    && Boolean(observedAt) && Date.parse(observedAt) <= now + 60000;
  const stale = available && (rate.is_stale === true || rate.eur_derivation === 'usdt-cross-last-valid'
    || now - Date.parse(observedAt) > 20 * 60000);
  return { available, stale, observedAt: available ? observedAt : null,
    buy: available ? rate.buy_bob_per_eur.toFixed(2) : null,
    sell: available ? rate.sell_bob_per_eur.toFixed(2) : null };
}

/** Initial HTML only: React keeps its existing converter, history and next-step links. */
export function renderEuroRateHtml(html, search = '', rate = null, now = Date.now()) {
  const language = new URLSearchParams(sanitizeLangSearch(search)).get('lang') === 'en' ? 'en' : 'es';
  const es = language === 'es';
  const suffix = es ? '' : '?lang=en';
  const canonical = BASE + PATH + suffix;
  const model = euroRateModel(rate, now);
  const heading = es ? 'Euro Blue Bolivia – EUR a BOB' : 'Euro Blue Bolivia – EUR to BOB';
  const title = model.available
    ? `${es ? (model.stale ? 'Euro Blue Bolivia: Última lectura' : 'Euro Blue Bolivia Hoy') : (model.stale ? 'Euro Blue Bolivia: Last reading' : 'Euro Blue Bolivia Today')}: ${es ? 'Compra' : 'Buy'} ${model.buy} · ${es ? 'Venta' : 'Sell'} ${model.sell}`
    : es ? 'Euro Blue Bolivia | EUR a BOB (Mercado Paralelo)' : 'Euro Blue Bolivia | EUR to BOB (Parallel Market)';
  const quote = model.available
    ? (es ? `Euro blue / paralelo en Bolivia: compra Bs ${model.buy} y venta Bs ${model.sell} por EUR.` : `Euro blue / parallel in Bolivia: buy Bs ${model.buy}, sell Bs ${model.sell} per EUR.`)
    : (es ? 'Referencia EUR/BOB no disponible. No mostramos una cotización de reemplazo.' : 'EUR/BOB reference unavailable. We do not display a replacement quote.');
  const when = model.observedAt ? new Intl.DateTimeFormat(es ? 'es-BO' : 'en-US', {
    timeZone: 'America/La_Paz', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(model.observedAt)) : null;
  const status = model.stale
    ? (es ? 'Última lectura disponible (desactualizada); no es una cotización actual.' : 'Last available reading (stale); not a current quote.')
    : '';
  const qualification = es ? 'Derivado vía USDT; no es una cotización de efectivo ni el tipo oficial.' : 'Derived via USDT; not a cash quote or the official rate.';
  const description = [quote, status, when ? `${es ? 'Lectura EUR' : 'EUR observation'}: ${when} (Bolivia).` : '', qualification].filter(Boolean).join(' ');
  const links = [
    ['/fuente-de-datos', es ? 'Metodología' : 'Methodology'], ['/calculadora', es ? 'Calculadora' : 'Calculator'],
    ['/', es ? 'Dólar blue' : 'Blue dollar'], ['/dolar-blue-hoy', es ? 'Dólar blue hoy' : 'Blue dollar today'],
    ['/real-a-boliviano', es ? 'Real a boliviano' : 'Real to boliviano'], ['/peso-a-boliviano', es ? 'Peso colombiano' : 'Colombian peso'],
  ];
  const shell = `<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="euro-a-boliviano"><div class="text-center space-y-4 mb-8">
<h1 class="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white">${esc(heading)}</h1>
<p class="text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto" data-euro-quote>${esc(quote)}</p>
${status ? `<p class="text-sm text-amber-700 dark:text-amber-300" data-euro-stale>${esc(status)}</p>` : ''}
<p class="text-sm text-gray-600 dark:text-gray-400">${esc(qualification)}</p>
${when ? `<p class="text-sm text-gray-600 dark:text-gray-400">${es ? 'Lectura EUR' : 'EUR observation'}: <time datetime="${esc(model.observedAt)}">${esc(when)}</time> (${es ? 'hora de Bolivia' : 'Bolivia time'}).</p>` : ''}
<nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="${es ? 'Enlaces relacionados' : 'Related links'}">${links.map(([path, label]) => `<a href="${path + suffix}" class="text-blue-600 dark:text-blue-400 font-medium">${esc(label)}</a>`).join('')}</nav>
</div></main>`;
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  // Replace only page identity and the crawl shell; keep app, styles, verification and security tags.
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: heading, description, url: canonical, inLanguage: es ? 'es-BO' : 'en-US' };
  const tags = [
    `<title>${esc(title)}</title>`,
    `<link rel="canonical" href="${canonical}" data-rh="true" />`,
    ...[['es', BASE + PATH], ['en', BASE + PATH + '?lang=en'], ['x-default', BASE + PATH]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', title], ['description', description], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', title], ['twitter:description', description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', title], ['og:description', description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
