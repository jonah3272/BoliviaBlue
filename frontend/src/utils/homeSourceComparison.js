import { sourceObservationModel, observationLabel, formatObservationRate } from './sourceObservation.js';
import { officialRateModel } from './officialRate.js';

export const HOME_SOURCE_CLASS = 'max-w-5xl mx-auto rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-4 sm:p-6 space-y-3 text-gray-700 dark:text-gray-200';

/** One evidence/copy model for the initial HTML and the interactive homepage. */
export function homeSourceComparison(rate, language = 'es', now = Date.now()) {
  const es = language !== 'en';
  const observation = sourceObservationModel(rate, now);
  // A matching snapshot timestamp is not enough when the clock is in the future.
  const future = observation.observedAt && Date.parse(observation.observedAt) > now + 5 * 60000;
  const sources = future ? { ...observation, available: false, stale: true, platforms: [], observation: null } : observation;
  const official = officialRateModel(rate, es ? 'es' : 'en', now);
  // The current BCB board publishes one TCO. A legacy two-sided quote's
  // midpoint is not evidence of that single published rate.
  const singleOfficial = official.available && Date.parse(official.official_observed_at) <= now + 5 * 60000 && official.official_buy === official.official_sell
    && official.official_mid === official.official_buy;
  const href = path => `${path}${es ? '' : '?lang=en'}`;
  return {
    sources, official, singleOfficial,
    observation: observationLabel(sources.observedAt, es ? 'es' : 'en'),
    rows: sources.platforms.map(p => ({ id: p.id, name: p.name, buy: formatObservationRate(p.buy), sell: formatObservationRate(p.sell) })),
    officialValue: singleOfficial ? formatObservationRate(official.official_mid) : null,
    officialObservation: singleOfficial ? observationLabel(official.official_observed_at, es ? 'es' : 'en') : null,
    copy: {
      heading: es ? 'Cotizaciones P2P por plataforma' : 'P2P quotes by platform',
      caption: es ? 'Referencias guardadas en la misma lectura · Bs por USDT' : 'Quotes saved in the same observation · Bs per USDT',
      platform: es ? 'Plataforma' : 'Platform',
      buy: es ? 'Bs que pagás al comprar 1 USDT' : 'Bs you pay to buy 1 USDT',
      sell: es ? 'Bs que recibís al vender 1 USDT' : 'Bs you receive selling 1 USDT',
      loading: es ? 'Cargando lectura…' : 'Loading observation…',
      stale: es ? 'Última lectura disponible; actualización pendiente. No es una cotización actual.' : 'Last available observation; update pending. Not a current quote.',
      missing: es ? 'Desglose de fuentes no disponible para este registro. No equivale a cero plataformas consultadas.' : 'Source breakdown unavailable for this record. This does not mean zero platforms were queried.',
      method: es ? 'Mediana por separado para compra y venta; solo se muestran los aportes guardados. Valores redondeados; el JSON conserva la precisión original.' : 'Separate buy and sell medians; only saved contributions are shown. Values are rounded; JSON retains the original precision.',
      caveat: es ? 'Antes de comisiones. Son referencias P2P USDT/BOB, no ofertas garantizadas ni cotizaciones de dólares en efectivo. Los montos, métodos de pago y liquidez pueden variar: no es un ranking de la mejor oferta.' : 'Before fees. These are P2P USDT/BOB references, not guaranteed offers or cash-dollar quotes. Amounts, payment methods and liquidity can differ: this is not a best-offer ranking.',
      officialHeading: es ? 'Referencia oficial BCB (TCO)' : 'Official BCB reference (TCO)',
      officialStale: es ? 'Último BCB verificado; actualización pendiente.' : 'Last verified BCB; update pending.',
      officialMissing: official.message || (es ? 'TCO único no disponible en este registro.' : 'Single TCO unavailable in this record.'),
      officialDate: es ? 'Fecha publicada por el BCB' : 'BCB publication date',
      officialRetrieved: es ? 'Consulta original' : 'Original retrieval',
      officialSource: es ? 'Fuente: Banco Central de Bolivia' : 'Source: Central Bank of Bolivia',
      officialCaveat: es ? 'Una sola referencia publicada en Bs por USD, separada de la mediana P2P. No es una oferta de compra o venta de efectivo ni la tasa garantizada de tu banco o tarjeta.' : 'One published reference in Bs per USD, separate from the P2P median. Not a cash buy/sell offer or your bank’s or card’s guaranteed rate.',
    },
    links: [
      { href: href('/fuente-de-datos'), label: es ? 'Método y límites' : 'Method and limits' },
      { href: href('/datos-historicos'), label: es ? 'Historial y descargas' : 'History and downloads' },
      { href: `${href('/prensa')}#corte-informativo`, label: es ? 'Citar esta lectura' : 'Cite this observation' },
    ],
  };
}

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

/** Static shell only. All dynamic fields are validated above and HTML-escaped. */
export function renderHomeSourceComparison(rate, language = 'es', now = Date.now()) {
  const m = homeSourceComparison(rate, language, now), c = m.copy;
  const table = m.sources.available
    ? `<div class="overflow-x-auto"><table class="w-full text-sm text-left tabular-nums"><caption class="text-left pb-2">${escape(c.caption)}</caption><thead><tr>${[c.platform,c.buy,c.sell].map(label => `<th scope="col" class="py-2 pr-3 align-bottom">${escape(label)}</th>`).join('')}</tr></thead><tbody>${m.rows.map(p => `<tr class="border-t border-gray-200 dark:border-gray-700"><th scope="row" class="py-2 pr-3 font-medium">${escape(p.name)}</th><td class="py-2 pr-3">${escape(p.buy)}</td><td class="py-2">${escape(p.sell)}</td></tr>`).join('')}</tbody></table></div><p class="text-xs">${escape(c.method)}</p>`
    : `<p class="text-sm">${escape(c.missing)}</p>`;
  const official = m.singleOfficial
    ? `<p class="font-semibold tabular-nums">${escape(m.officialValue)} Bs/USD</p>${m.official.stale ? `<p class="text-sm font-semibold text-amber-700 dark:text-amber-300">${escape(c.officialStale)}</p>` : ''}<p class="text-xs">${escape(c.officialDate)}: <time datetime="${escape(m.official.official_source_date)}">${escape(m.official.official_source_date)}</time></p><p class="text-xs">${escape(c.officialRetrieved)}: <time datetime="${escape(m.official.official_observed_at)}">${escape(m.officialObservation)}</time></p><a class="text-sm text-blue-700 dark:text-blue-300 underline" href="${escape(m.official.official_observation.source_url)}">${escape(c.officialSource)}</a>`
    : `<p class="text-sm">${escape(c.officialMissing)}</p>`;
  return `<section data-home-source-comparison aria-labelledby="home-source-comparison-heading" class="${HOME_SOURCE_CLASS}"><h2 id="home-source-comparison-heading" class="text-lg font-bold">${escape(c.heading)}</h2><p class="text-sm"><span>${m.sources.observedAt ? `<time datetime="${escape(m.sources.observedAt)}">${escape(m.observation)}</time>` : escape(m.observation)}</span>${m.sources.stale ? `<strong class="block text-amber-700 dark:text-amber-300">${escape(c.stale)}</strong>` : ''}</p>${table}<p class="text-xs">${escape(c.caveat)}</p><div data-home-official-reference class="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1"><h3 class="font-semibold">${escape(c.officialHeading)}</h3>${official}<p class="text-xs">${escape(c.officialCaveat)}</p></div><nav data-home-source-links class="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300">${m.links.map(link => `<a href="${escape(link.href)}">${escape(link.label)}</a>`).join('')}</nav></section>`;
}
