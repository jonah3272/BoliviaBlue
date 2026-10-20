import { travelerGuideMeta } from '../frontend/src/utils/travelerGuideMeta.js';
import { buildDollarRateSearchCopy } from '../frontend/src/utils/dollarRateSearchCopy.js';

export const TRAVELER_GUIDE_PATHS = new Set(['/guia-dinero-bolivia', '/bolivia-money-guide']);
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Refresh only the guide's quote paragraph and metadata; keep its language and navigation. */
export function renderTravelerGuideHtml(html, path, rates, now = Date.now()) {
  const es = path !== '/bolivia-money-guide';
  // A future timestamp is not evidence of an observed reading.
  const observedRates = rates?.updatedAt && Date.parse(rates.updatedAt) > now ? null : rates;
  const copy = buildDollarRateSearchCopy({ ...observedRates, language: es ? 'es' : 'en', now });
  const { title, description } = travelerGuideMeta(es ? 'es' : 'en');
  const quote = copy.hasRates
    ? `${es ? 'Referencia P2P USDT/BOB: compra' : 'P2P USDT/BOB reference: buy'} Bs <span data-live-buy>${copy.buyStr}</span> · ${es ? 'venta' : 'sell'} Bs <span data-live-sell>${copy.sellStr}</span>. `
    : '';
  const observation = copy.observedAt
    ? `${es ? (copy.isStale ? 'Última lectura disponible (desactualizada)' : 'Lectura') : (copy.isStale ? 'Last available reading (stale)' : 'Observed')}: <time data-live-when datetime="${esc(copy.observedAt)}">${esc(copy.observedAt)}</time>. `
    : `${esc(copy.observation)} `;
  const paragraph = `<p class="text-base text-gray-700 mt-3" data-traveler-quote>${quote}${observation}${es ? 'USDT es una referencia del USD, no una cotización de efectivo.' : 'USDT is a USD proxy, not a cash quote.'}</p>`;
  let out = html.replace(/<p\b[^>]*\bdata-traveler-quote[^>]*>[\s\S]*?<\/p>|<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?\bdata-live-buy(?:(?!<\/p>)[\s\S])*?<\/p>/i, () => paragraph);
  out = out.replace(/<title>[^<]*<\/title>/i, () => `<title>${esc(title)}</title>`);
  out = out.replace(/<meta\b[^>]*>/gi, tag => {
    const name = tag.match(/\b(?:name|property)=["']([^"']+)["']/i)?.[1];
    const value = ['title', 'og:title', 'twitter:title'].includes(name) ? title : ['description', 'og:description', 'twitter:description'].includes(name) ? description : null;
    return value ? tag.replace(/\bcontent=["'][^"']*["']/i, () => `content="${esc(value)}"`) : tag;
  });
  return { html: out, live: copy.hasRates && Boolean(copy.observedAt) && !copy.isStale, rates };
}
