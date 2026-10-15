// Explicit published translation pairs. Never guess a partner from a slug or title.
// English keeps its existing ?lang=en canonical; bare English slugs also resolve.
export const BLOG_TRANSLATIONS = [
  { es: 'guia-comprar-dolares-binance-p2p', en: 'guide-buy-dollars-binance-p2p' },
  { es: 'que-es-usdt-tether-guia-completa', en: 'what-is-usdt-tether-complete-guide' },
  { es: 'estrategias-proteger-ahorros-volatilidad', en: 'strategies-protect-savings-volatility' },
  { es: 'historia-dolar-blue-bolivia-2020-2025', en: 'history-blue-dollar-bolivia-2020-2025' },
  { es: 'por-que-se-llama-dolar-blue-origen', en: 'why-is-it-called-blue-dollar-origin' },
];

export function blogLocaleForSlug(slug) {
  const pair = BLOG_TRANSLATIONS.find(({ es, en }) => slug === es || slug === en);
  return pair ? { language: slug === pair.en ? 'en' : 'es', pair } : null;
}

export function blogLocalePaths(slug) {
  const locale = blogLocaleForSlug(slug);
  return locale ? {
    es: `/blog/${locale.pair.es}`,
    en: `/blog/${locale.pair.en}?lang=en`,
  } : null;
}
