const CURRENCIES = new Set(['USD', 'BRL', 'EUR', 'COP', 'PEN', 'ARS', 'CLP']);
const ROUTES = { USD: '/dolar-blue-hoy', BRL: '/real-a-boliviano', EUR: '/euro-a-boliviano', COP: '/peso-a-boliviano', PEN: '/sol-a-boliviano', ARS: '/peso-argentino-a-boliviano', CLP: '/peso-chileno-a-boliviano' };

/** Display the existing shared snapshot; this helper never fetches or derives a new price. */
export function headerRateSnapshot(rate, currency = 'USD', { now = Date.now(), error = false } = {}) {
  const code = CURRENCIES.has(currency) ? currency : 'USD';
  const key = code.toLowerCase();
  const positive = (value) => value != null && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const buy = positive(rate?.[`buy_bob_per_${key}`] ?? (code === 'USD' ? rate?.buy : null));
  const sell = positive(rate?.[`sell_bob_per_${key}`] ?? (code === 'USD' ? rate?.sell : null));
  const updatedAt = rate?.[`${key}_updated_at_iso`] || rate?.updated_at_iso || rate?.updatedAt || null;
  const timestamp = Date.parse(updatedAt);
  const stale = Boolean(error || rate?.is_stale || !Number.isFinite(timestamp) || now - timestamp > 20 * 60000);
  return { currency: code, buy, sell, updatedAt, stale, available: buy !== null && sell !== null, path: ROUTES[code] };
}

export function reservedBottomSpace(paddingBottom) {
  const value = Number.parseFloat(paddingBottom);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
