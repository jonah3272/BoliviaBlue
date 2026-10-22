import { formatDateTime } from '../frontend/src/utils/formatters.js';
import { bolivianBlueGuide } from '../frontend/src/data/bolivianBlueGuide.js';
import { rateReadingGuide } from '../frontend/src/data/rateReadingGuide.js';
import { getCuantoConversionGuide } from '../frontend/src/data/cuantoConversionGuide.js';
import { buildDollarRateSearchCopy, DOLLAR_SEARCH_PAGES } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { homeConversionCopy } from '../frontend/src/utils/homeConversionCopy.js';

const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const HEADINGS = {
  '/bolivian-blue': { es: 'Bolivian Blue – Tipo de Cambio Dólar Blue Bolivia', en: 'Bolivian Blue – Bolivia Blue Dollar Exchange Rate' },
  '/': { es: 'Dólar blue en Bolivia hoy', en: 'Blue dollar in Bolivia today' },
  '/dolar-blue-hoy': { es: 'Cotización del Dólar Blue Hoy – Bolivia', en: 'Blue Dollar Today Bolivia' },
  '/cuanto-esta-dolar-bolivia': { es: '¿Cuánto Está el Dólar en Bolivia?', en: 'How Much is the Dollar in Bolivia?' },
};

/** Replace only the initial crawl shell and its page identity; keep canonical ownership. */
export function renderDollarRateHtml(html, path, rates = null, language = 'es', now = Date.now()) {
  if (!DOLLAR_SEARCH_PAGES[path]) return html;
  const model = buildDollarRateSearchCopy({ ...rates, page: DOLLAR_SEARCH_PAGES[path], language, now });
  const es = model.language === 'es';
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escape(model.title)}</title>`);
  for (const [attribute, name, value] of [
    ['name', 'title', model.title], ['name', 'description', model.description],
    ['property', 'og:title', model.title], ['property', 'og:description', model.description],
    ['name', 'twitter:title', model.title], ['name', 'twitter:description', model.description],
  ]) {
    const pattern = new RegExp(`(<meta\\s+${attribute}=["']${name}["']\\s+content=)["'][^"']*["']`, 'i');
    out = out.replace(pattern, () => `<meta ${attribute}="${name}" content="${escape(value)}"`);
  }
  const mainPattern = /<main\b[^>]*data-seo-shell=["'][^"']*["'][^>]*>[\s\S]*?<\/main>/i;
  const previous = out.match(mainPattern)?.[0] || '';
  const oldNav = [...previous.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)].map((m) => m[0]).join('');
  const nav = es ? (oldNav || '<nav><a href="/">Inicio</a> · <a href="/dolar-blue-hoy">Dólar blue hoy</a> · <a href="/fuente-de-datos">Metodología</a> · <a href="/datos-historicos">Historial</a></nav>') : `<nav class="flex flex-wrap justify-center gap-3 mt-4"><a href="/?lang=en">Home</a><a href="/dolar-blue-hoy?lang=en">Today's quote</a><a href="/fuente-de-datos?lang=en">Methodology</a><a href="/datos-historicos?lang=en">Historical data</a></nav>`;
  const conversionGuide = path === '/cuanto-esta-dolar-bolivia' ? getCuantoConversionGuide(language) : null;
  // This route delegates amount estimates to the calculator; homepage arithmetic stays unchanged.
  const conversion = conversionGuide
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto" data-cuanto-reference-cards>${[[conversionGuide.buyLabel, model.buyStr], [conversionGuide.sellLabel, model.sellStr]].map(([label, value]) => `<div class="rounded-lg bg-white p-4"><p>${escape(label)}</p><p class="text-2xl font-bold">${value || '—'}</p><p>${escape(conversionGuide.unit)}</p></div>`).join('')}</div><section class="max-w-3xl mx-auto space-y-3" data-cuanto-conversion-guide><h2 class="text-xl font-semibold">${escape(conversionGuide.heading)}</h2><p>${escape(conversionGuide.explanation)}</p><div class="flex flex-wrap justify-center gap-3">${conversionGuide.presets.map((preset) => `<a href="${escape(preset.href)}" class="inline-flex items-center min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">${escape(preset.label)}</a>`).join('')}</div></section>`
    : '';
  const pair = path === '/' ? `<p data-home-rate-line class="font-bold text-gray-900 tabular-nums"><span>${es ? 'Compra' : 'Buy'} <span data-live-buy>${model.buyStr || '—'}</span></span> <span>· ${es ? 'Venta' : 'Sell'} <span data-live-sell>${model.sellStr || '—'}</span></span></p>` : '';
  const conversionCopy = homeConversionCopy(language);
  const homeConversion = `<p data-home-conversion class="font-semibold text-gray-800">${escape(conversionCopy.prefix)} <span data-live-usd100>${model.hasRates ? Math.round(Number(model.buyStr) * 100) : '—'}</span> Bs<span class="mt-1 block text-xs font-normal leading-4 text-gray-500">${escape(conversionCopy.note)}</span></p>`;
  const observed = formatDateTime(model.observedAt, es ? 'es-BO' : 'en-US');
  const homeObservation = `<p data-home-observation class="text-gray-500">${observed
    ? `<span class="block">${es ? 'Lectura P2P' : 'P2P reading'}: <time datetime="${escape(model.observedAt)}">${escape(observed)}</time></span> <span class="block">${es ? '(hora de Bolivia)' : '(Bolivia time)'}${model.isStale ? (es ? ' · dato desactualizado' : ' · stale reading') : ''}</span>`
    : escape(model.observation)}</p>`;
  const guide = path === '/bolivian-blue' ? bolivianBlueGuide(language) : rateReadingGuide(language);
  const readingGuide = `<section class="max-w-3xl mx-auto space-y-4" data-rate-reading-guide><h2 class="text-2xl font-bold">${escape(guide.heading)}</h2>${guide.items.map(([q, a]) => `<div><h3 class="font-semibold">${escape(q)}</h3><p>${escape(a)}</p></div>`).join('')}<p><a href="/prensa#corte-informativo">${es ? 'Corte informativo para prensa' : 'Newsroom snapshot'}</a> · <a href="/fuente-de-datos">${es ? 'Metodología y límites' : 'Methodology and limits'}</a> · <a href="/datos-historicos">${es ? 'Gráfico y descargas históricas' : 'History chart and downloads'}</a></p></section>`;
  const headingAttributes = path === '/'
    ? 'data-home-heading class="font-bold text-gray-900"'
    : 'class="text-3xl sm:text-5xl font-bold text-gray-900"';
  const homeHref = (pathname) => `${pathname}${es ? '' : '?lang=en'}`;
  const cashCardLink = `<aside class="max-w-3xl mx-auto rounded-xl border border-sky-200 p-4"><h2 class="font-semibold">${es ? '¿Efectivo o tarjeta en Bolivia?' : 'Cash or card in Bolivia?'}</h2><p>${es ? 'Compará el dólar blue, la referencia BCB y el costo de tu tarjeta después de comisiones.' : 'Compare the blue dollar, BCB reference and your card cost after fees.'}</p><a class="text-sky-700 underline" href="${homeHref('/efectivo-o-tarjeta-bolivia')}">${es ? 'Ver el comparador del día' : 'Open the daily comparison'}</a></aside>`;
  const homeCitationLinks = `<div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-600"><a href="${homeHref('/fuente-de-datos')}" class="font-medium text-emerald-700">${es ? 'Metodología' : 'Methodology'}</a><a href="${homeHref('/prensa')}" class="font-medium text-emerald-700">${es ? 'Cómo citar' : 'How to cite'}</a><a href="/llms.txt" class="font-medium text-emerald-700">llms.txt</a><a href="${homeHref('/api-docs')}" class="font-medium text-emerald-700">API</a></div>`;
  const homeAnswer = `<section class="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-3 sm:px-6 sm:py-5 mt-4 max-w-3xl mx-auto text-left" aria-label="${es ? 'Respuesta sobre el dólar blue hoy' : 'Blue dollar answer for today'}" data-ai-citation="rate-answer"><details><summary class="cursor-pointer list-none text-sm text-gray-800"><span class="font-medium">${es ? 'Referencia P2P · Bolivia Blue' : 'P2P reference · Bolivia Blue'}</span> <span class="text-xs text-emerald-700">(${es ? 'metodología' : 'methodology'})</span></summary><p class="mt-2 text-sm leading-relaxed text-gray-800" data-dollar-rate-answer>${escape(model.answer)}</p>${homeCitationLinks}</details></section>`;
  // The retained shell cannot open the React-only alert form while its module is unavailable.
  const homeHero = `<section data-home-rate-hero class="relative text-center md:overflow-hidden md:rounded-3xl md:border md:border-sky-200/60 md:px-6 md:py-6"><h1 ${headingAttributes}>${HEADINGS['/'][model.language]}</h1><p class="hidden md:block mt-3 text-sm text-gray-600">${es ? 'Referencia P2P USDT/BOB · Bs por USD' : 'P2P USDT/BOB reference · Bs per USD'}</p>${pair}${homeConversion}${homeObservation}${homeAnswer}<div class="hidden md:flex flex-wrap items-center justify-center gap-3 mt-4" data-home-secondary-actions><a href="${homeHref('/dolar-blue-hoy')}" class="inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-bold text-white">${es ? 'Cotización completa de hoy' : 'Full quote for today'}</a><a href="${homeHref('/comprar-dolares')}" class="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-800">${es ? 'Cómo comprar dólares' : 'How to buy dollars'}</a></div></section>`;
  const shell = path === '/'
    ? `<main class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8 md:py-6 space-y-6 sm:space-y-8 md:space-y-10" data-seo-shell="${es ? 'home' : 'english'}">${homeHero}${cashCardLink}${nav}${readingGuide}</main>`
    : `<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="${es ? DOLLAR_SEARCH_PAGES[path] : 'english'}"><div class="text-center space-y-4 mb-8"><h1 ${headingAttributes}>${path === '/bolivian-blue' ? HEADINGS[path][model.language] : es ? HEADINGS[path].es : escape(model.title)}</h1><p class="text-base text-gray-600 max-w-3xl mx-auto" data-dollar-rate-answer>${escape(model.answer)}</p>${conversion}${nav}</div>${readingGuide}</main>`;
  out = out.replace(mainPattern, () => shell);
  // Initial shells contain only WebPage/Breadcrumb. Update that existing WebPage, not new hidden facts.
  out = out.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (all, start, json, end) => {
    try {
      const schema = JSON.parse(json);
      if (schema['@type'] === 'WebApplication') return '';
      if (schema['@type'] === 'WebSite' || schema['@type'] === 'Organization') {
        delete schema.description;
        return `${start}${JSON.stringify(schema).replaceAll('<', '\\u003c')}${end}`;
      }
      if (schema['@type'] !== 'WebPage') return all;
      schema.name = model.title;
      schema.description = model.answer;
      if (model.observedAt) schema.dateModified = model.observedAt;
      else delete schema.dateModified;
      return `${start}${JSON.stringify(schema).replaceAll('<', '\\u003c')}${end}`;
    } catch { return all; }
  });
  return out;
}
