import { validObservationTime } from './observationTime.js';
import { sourceObservationModel, formatObservationRate } from './sourceObservation.js';
export { validObservationTime } from './observationTime.js';

/** Shared search and visible-answer copy for the three primary dollar routes. */
export const DOLLAR_SEARCH_PAGES = {
  '/': 'home',
  '/dolar-blue-hoy': 'dolar-blue-hoy',
  '/cuanto-esta-dolar-bolivia': 'cuanto',
};
const TITLES = {
  home: { es: 'Dólar Blue Bolivia', en: 'Bolivia Blue Dollar' },
  'dolar-blue-hoy': { es: 'Dólar Blue Hoy Bolivia', en: 'Blue Dollar Today Bolivia' },
  cuanto: { es: '¿Cuánto está el dólar en Bolivia?', en: 'How Much Is the Dollar in Bolivia?' },
};

function rateString(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? number.toFixed(2) : null;
}

/** Match the existing client aliases without coercing booleans or inventing timestamps. */
export function normalizeDollarRatePayload(data) {
  if (!data || typeof data !== 'object') return null;
  const buy = rateString(data.buy_bob_per_usd ?? data.buy);
  const sell = rateString(data.sell_bob_per_usd ?? data.sell);
  if (!buy || !sell) return null;
  const updatedAt = validObservationTime(data.updated_at_iso ?? data.t ?? data.updatedAt);
  return {
    buy, sell, updatedAt,
    isStale: data.is_stale === true || data.isStale === true,
    // Keep the original values for same-record median validation. Display rounding
    // must never become the evidence used to validate stored contributors.
    ...(data.source_observation ? { sourceRate: {
      buy: data.buy_bob_per_usd ?? data.buy,
      sell: data.sell_bob_per_usd ?? data.sell,
      updatedAt,
      source_observation: data.source_observation,
    } } : {}),
  };
}

export function buildDollarRateSearchCopy({ page = 'home', buy, sell, updatedAt, sourceRate = null, isStale = false, language = 'es', now = null } = {}) {
  const lang = language === 'en' ? 'en' : 'es';
  const es = lang === 'es';
  const buyStr = rateString(buy);
  const sellStr = rateString(sell);
  const hasRates = Boolean(buyStr && sellStr);
  const observedAt = hasRates ? validObservationTime(updatedAt) : null;
  // Match the existing client context's age rule. The caller supplies the clock only
  // for age comparison; it is never substituted for an observation timestamp.
  const stale = Boolean(observedAt && (isStale || (Number.isFinite(now) && Math.floor((now - new Date(observedAt).getTime()) / 60000) > 45)));
  const when = observedAt ? new Intl.DateTimeFormat(es ? 'es-BO' : 'en-US', {
    timeZone: 'America/La_Paz', year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(observedAt)) : null;
  const baseTitle = (TITLES[page] || TITLES.home)[lang];
  const analyticsTitle = `${baseTitle} | Bolivia Blue`;
  const title = page === 'home'
    ? (es ? 'Dólar blue Bolivia hoy: compra y venta P2P | Bolivia Blue' : 'Bolivia blue dollar today: P2P buy and sell | Bolivia Blue')
    : hasRates
    ? `${baseTitle}: ${es ? 'Compra' : 'Buy'} ${buyStr} · ${es ? 'Venta' : 'Sell'} ${sellStr}${page === 'home' ? ' | Bolivia Blue' : ''}`
    : analyticsTitle;
  const observation = !hasRates
    ? (es ? 'Lectura P2P no disponible.' : 'P2P reading unavailable.')
    : when
      ? `${stale ? (es ? 'Última lectura disponible (desactualizada)' : 'Last available reading (stale)') : (es ? 'Lectura' : 'Observed')}: ${when} (Bolivia).`
      : `${stale ? (es ? 'Lectura desactualizada. ' : 'Stale reading. ') : ''}${es ? 'Hora de lectura no disponible.' : 'Observation time unavailable.'}`;
  const quote = hasRates
    ? (es ? `Referencia P2P USDT/BOB: compra Bs ${buyStr}, venta Bs ${sellStr}.` : `P2P USDT/BOB reference: buy Bs ${buyStr}, sell Bs ${sellStr}.`)
    : (es ? 'Referencia del dólar blue en Bolivia a partir de USDT/BOB P2P.' : 'Bolivia blue dollar reference based on P2P USDT/BOB.');
  const qualification = es ? 'No es cotización de efectivo.' : 'Not a cash quote.';
  const quoteDescription = `${quote} ${observation} ${qualification}`;
  const description = page === 'home'
    ? (es ? 'Consultá la referencia P2P USDT/BOB del dólar blue en Bolivia: compra, venta, hora de lectura e historial. No es cotización de efectivo.' : 'See the P2P USDT/BOB reference for the blue dollar in Bolivia: buy, sell, observation time and history. Not a cash quote.')
    : quoteDescription;
  let answer = `${quoteDescription} ${es
    ? 'USDT se usa como referencia del USD. Se intentan actualizaciones periódicas y puede haber demoras. Consultá la metodología y el historial; la composición de fuentes de esta lectura no está confirmada aquí.'
    : 'USDT is used as a USD proxy. Updates are attempted periodically and may be delayed. See the methodology and history; the source composition of this reading is not confirmed here.'}`;
  if (page === 'home') {
    // Validate the unrounded same-record values, not the two-decimal display pair.
    const sources = sourceObservationModel(sourceRate, now);
    const sameRecord = hasRates && sources.available && Date.parse(sources.observedAt) === Date.parse(observedAt)
      && rateString(sources.buy) === buyStr && rateString(sources.sell) === sellStr;
    const evidence = sameRecord
      ? `${es ? 'Referencias guardadas con esta lectura' : 'Quotes stored with this observation'}: ${sources.platforms.map(p => `${p.name}: ${es ? 'compra' : 'buy'} Bs ${formatObservationRate(p.buy)}, ${es ? 'venta' : 'sell'} Bs ${formatObservationRate(p.sell)}`).join('; ')}. ${es ? 'Mediana por separado para compra y venta; se muestran solo los aportes guardados.' : 'Separate buy and sell medians; only stored contributions are shown.'}`
      : (es ? 'Desglose de fuentes no disponible para este registro; no equivale a cero plataformas consultadas.' : 'Source breakdown unavailable for this record; this does not mean zero platforms were queried.');
    answer = `${quoteDescription} ${es ? 'USDT se usa como referencia del USD. Se intentan actualizaciones periódicas y puede haber demoras.' : 'USDT is used as a USD proxy. Updates are attempted periodically and may be delayed.'} ${evidence} ${es ? 'Consultá la metodología y el historial.' : 'See the methodology and history.'}`;
  }
  return { title, description, analyticsTitle, answer, observation, observedAt, buyStr, sellStr, hasRates, isStale: stale, language: lang };
}
