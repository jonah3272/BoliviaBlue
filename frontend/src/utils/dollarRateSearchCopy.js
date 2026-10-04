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

/** Require an actual dated observation with an explicit timezone, never request time. */
export function validObservationTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
  const [year, month, day, hour, minute, second] = value.slice(0, 19).split(/[-T:]/).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || hour > 23 || minute > 59 || second > 59) return null;
  return Number.isFinite(new Date(value).getTime()) ? value : null;
}

/** Match the existing client aliases without coercing booleans or inventing timestamps. */
export function normalizeDollarRatePayload(data) {
  if (!data || typeof data !== 'object') return null;
  const buy = rateString(data.buy_bob_per_usd ?? data.buy);
  const sell = rateString(data.sell_bob_per_usd ?? data.sell);
  if (!buy || !sell) return null;
  return { buy, sell, updatedAt: validObservationTime(data.updated_at_iso ?? data.t ?? data.updatedAt), isStale: data.is_stale === true || data.isStale === true };
}

export function buildDollarRateSearchCopy({ page = 'home', buy, sell, updatedAt, isStale = false, language = 'es', now = null } = {}) {
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
  const title = hasRates
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
  const description = `${quote} ${observation} ${qualification}`;
  const answer = `${description} ${es
    ? 'USDT se usa como referencia del USD. Se intentan actualizaciones periódicas y puede haber demoras. Consultá la metodología y el historial; la composición de fuentes de esta lectura no está confirmada aquí.'
    : 'USDT is used as a USD proxy. Updates are attempted periodically and may be delayed. See the methodology and history; the source composition of this reading is not confirmed here.'}`;
  return { title, description, analyticsTitle, answer, observation, observedAt, buyStr, sellStr, hasRates, isStale: stale, language: lang };
}
