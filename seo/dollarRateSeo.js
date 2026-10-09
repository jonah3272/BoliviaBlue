import { rateReadingGuide } from '../frontend/src/data/rateReadingGuide.js';
import { getCuantoConversionGuide } from '../frontend/src/data/cuantoConversionGuide.js';
import { buildDollarRateSearchCopy, DOLLAR_SEARCH_PAGES } from '../frontend/src/utils/dollarRateSearchCopy.js';

const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const HEADINGS = {
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
    : path === '/' && es
      ? `<p class="text-lg font-semibold text-gray-800">100 USD ≈ <span data-live-usd100>${model.hasRates ? Math.round(Number(model.buyStr) * 100) : '—'}</span> Bs (compra P2P). <a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a></p>` : '';
  const pair = path === '/' && es ? `<p class="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">Compra <span data-live-buy>${model.buyStr || '—'}</span> · Venta <span data-live-sell>${model.sellStr || '—'}</span></p>` : '';
  const guide = rateReadingGuide(language);
  const readingGuide = `<section class="max-w-3xl mx-auto space-y-4" data-rate-reading-guide><h2 class="text-2xl font-bold">${escape(guide.heading)}</h2>${guide.items.map(([q, a]) => `<div><h3 class="font-semibold">${escape(q)}</h3><p>${escape(a)}</p></div>`).join('')}<p><a href="/prensa#corte-informativo">${es ? 'Corte informativo para prensa' : 'Newsroom snapshot'}</a> · <a href="/fuente-de-datos">${es ? 'Metodología y límites' : 'Methodology and limits'}</a> · <a href="/datos-historicos">${es ? 'Gráfico y descargas históricas' : 'History chart and downloads'}</a></p></section>`;
  const shell = `<main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="${es ? DOLLAR_SEARCH_PAGES[path] : 'english'}"><div class="text-center space-y-4 mb-8"><h1 class="text-3xl sm:text-5xl font-bold text-gray-900">${path === '/' ? HEADINGS[path][model.language] : es ? HEADINGS[path].es : escape(model.title)}</h1>${path === '/' && es ? '<p class="text-base text-gray-600">Bolivian Blue · dólar blue hoy en Bolivia</p>' : ''}${pair}<p class="text-base text-gray-600 max-w-3xl mx-auto" data-dollar-rate-answer>${escape(model.answer)}</p>${conversion}${nav}</div>${readingGuide}</main>`;
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
