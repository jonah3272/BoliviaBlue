/** Shared navigation items — keep MobileMenu and Navigation in sync */

export const PRIMARY_NAV_ITEMS = [
  { path: '/dolar-blue-hoy', key: 'navDolarHoy', icon: 'dashboard' },
  { path: '/', key: 'navDashboard', shortKey: 'navDashboardShort', icon: 'dashboard' },
  { path: '/calculadora', key: 'navCalculator', icon: 'calculator' },
  { path: '/comprar-dolares', key: 'navBuyDollars', icon: 'buy' },
  { path: '/noticias', key: 'navNews', icon: 'news' },
  { path: '/blog', key: 'navBlog', icon: 'blog' },
];

export const SECONDARY_NAV_ITEMS = [
  { path: '/dolar-paralelo-bolivia-en-vivo', key: 'navEnVivo', icon: 'dashboard' },
  { path: '/bolivian-blue', key: 'navBolivianBlue', icon: 'dashboard' },
  { path: '/datos-historicos', key: 'navHistoricos', icon: 'dashboard' },
  { path: '/plataformas', key: 'navPlataformas', icon: 'platform' },
  { path: '/bancos', key: 'navBancos', icon: 'bank' },
  { path: '/acerca-de', key: 'navAbout', icon: 'about' },
  { path: '/prensa', key: 'navPress', icon: 'about' },
  { path: '/publicitar', key: 'navAdvertise', icon: 'about' },
  { path: '/contacto', key: 'navContact', icon: 'contact' },
  { path: '/preguntas-frecuentes', key: 'navFAQ', icon: 'faq' },
  { path: '/terminos', key: 'navTerms', icon: 'terms' },
  { path: '/politica-de-privacidad', key: 'navPrivacy', icon: 'privacy' },
];

const primaryPaths = new Set(PRIMARY_NAV_ITEMS.map((item) => item.path));

/** Full hamburger list: primary bar + secondary (no duplicate paths) */
export const MOBILE_NAV_ITEMS = [
  ...PRIMARY_NAV_ITEMS,
  ...SECONDARY_NAV_ITEMS.filter((item) => !primaryPaths.has(item.path)),
];
