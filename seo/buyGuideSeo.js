import { getBuyGuidePage } from '../frontend/src/data/buyGuidePage.js';
import { ELDORADO_GUIDE_CHECKED, ELDORADO_GUIDE_SOURCES } from '../frontend/src/data/eldoradoGuide.js';
import { BUY_USDT_INTENT, RECEIVE_PAYMENTS_INTENT } from '../frontend/src/config/referrals.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const PATH = '/comprar-dolares';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function buyGuidePageForSearch(search = '') {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  return getBuyGuidePage(params.get('lang') === 'en' ? 'en' : 'es', params.get('intent'), params.get('operation'));
}

/** No live quote or provider request: render the same reviewed guide data as React. */
export function renderBuyGuideHtml(html, search = '') {
  const page = buyGuidePageForSearch(search);
  const { language, intent, operation, offer, guide } = page;
  const es = language === 'es';
  const canonical = BASE + PATH + (es ? '' : '?lang=en');
  const hrefFor = (nextIntent, nextOperation = operation) => {
    const params = new URLSearchParams({ intent: nextIntent, operation: nextOperation });
    if (!es) params.set('lang', 'en');
    return PATH + '?' + params.toString() + '#guia';
  };
  const localHref = (path) => path + (es ? '' : '?lang=en');
  const linkClass = 'text-blue-700 dark:text-blue-300 underline';
  const sources = intent === BUY_USDT_INTENT
    ? `<p>${es ? 'Fuentes oficiales consultadas' : 'Official sources checked'}: <time datetime="${ELDORADO_GUIDE_CHECKED}">${ELDORADO_GUIDE_CHECKED}</time>. ${es ? 'La app y sus condiciones pueden cambiar.' : 'App screens and terms can change.'}</p><ul>${ELDORADO_GUIDE_SOURCES.map(([, spanish, english, href]) => `<li><a class="${linkClass}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(es ? spanish : english)}</a></li>`).join('')}</ul>`
    : `<a class="${linkClass}" href="${esc(offer.source)}" target="_blank" rel="noopener noreferrer">${es ? 'Ver instrucciones oficiales del proveedor' : 'Read the provider’s official instructions'}</a>`;
  const shell = `<main data-seo-shell="comprar-dolares" class="google-anno-skip max-w-5xl mx-auto px-4 py-8 space-y-6 text-gray-900 dark:text-white">
<h1 class="text-3xl font-bold">${esc(page.heading)}</h1><p>${esc(page.introduction)}</p>
<nav class="flex flex-wrap gap-4" aria-label="${es ? 'Tu objetivo' : 'Your goal'}"><a class="${linkClass}" href="${esc(hrefFor(BUY_USDT_INTENT))}"${intent === BUY_USDT_INTENT ? ' aria-current="true"' : ''}>${es ? 'Comprar USDT' : 'Buy USDT'}</a><a class="${linkClass}" href="${esc(hrefFor(RECEIVE_PAYMENTS_INTENT))}"${intent === RECEIVE_PAYMENTS_INTENT ? ' aria-current="true"' : ''}>${es ? 'Cobrar del exterior' : 'Get paid from abroad'}</a></nav>
<section class="space-y-3"><h2 class="text-2xl font-bold">${esc(offer.headline)}</h2><p>${esc(offer.body)}</p><p>${esc(offer.qualification)}</p></section>
<section id="guia" class="space-y-4"><h2 class="text-2xl font-bold">${esc(offer.guideLabel)}</h2><p>${esc(offer.guideSummary || offer.body)}</p>
${intent === BUY_USDT_INTENT ? `<nav class="flex flex-wrap gap-4" aria-label="${es ? 'Dirección de la conversión' : 'Conversion direction'}"><a class="${linkClass}" href="${esc(hrefFor(intent, 'buy'))}"${operation === 'buy' ? ' aria-current="true"' : ''}>${es ? 'Pago BOB → Recibo USDT' : 'Pay BOB → Receive USDT'}</a><a class="${linkClass}" href="${esc(hrefFor(intent, 'sell'))}"${operation === 'sell' ? ' aria-current="true"' : ''}>${es ? 'Vendo USDT → Recibo BOB' : 'Sell USDT → Receive BOB'}</a></nav><p>${esc(guide.requirements)}</p>` : ''}
<ol class="list-decimal pl-6 space-y-4">${offer.steps.map(([title, body]) => `<li><h3 class="font-semibold">${esc(title)}</h3><p>${esc(body)}</p></li>`).join('')}</ol>
${intent === BUY_USDT_INTENT ? `<aside class="border border-amber-400 rounded-xl p-4"><strong>${esc(guide.warningTitle)}</strong><p>${esc(guide.warning)}</p></aside>` : ''}
<p><a class="inline-block rounded-xl bg-sky-700 text-white px-5 py-3 font-bold" href="${esc(offer.href)}" target="_blank" rel="sponsored noopener noreferrer">${esc(offer.cta)}</a></p><p class="text-sm">${esc(offer.disclosure)}</p>
<div class="text-sm space-y-2">${sources}</div></section>
<nav class="flex flex-wrap gap-4" aria-label="${es ? 'Enlaces relacionados' : 'Related links'}"><a class="${linkClass}" href="${esc(localHref('/'))}">${es ? 'Inicio' : 'Home'}</a><a class="${linkClass}" href="${esc(localHref('/fuente-de-datos'))}">${es ? 'Metodología y fuentes' : 'Methodology and sources'}</a><a class="${linkClass}" href="${esc(localHref('/datos-historicos'))}">${es ? 'Datos históricos' : 'Historical data'}</a></nav></main>`;

  // Replace SEO-owned identity only; retain scripts, styles, security and ad configuration.
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['es', BASE + PATH], ['en', BASE + PATH + '?lang=en'], ['x-default', BASE + PATH]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', page.title], ['description', page.description], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', page.title], ['twitter:description', page.description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', page.title], ['og:description', page.description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.howToSchema).replace(/</g, '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
