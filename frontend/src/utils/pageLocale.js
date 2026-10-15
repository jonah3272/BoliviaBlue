import { sanitizeLangSearch } from './urlLang.js';
import { blogLocaleForSlug } from './blogLocale.js';

export const normalizeLocalePath = (pathname = '/') => pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';

function blogLocaleForPath(pathname) {
  const match = normalizeLocalePath(pathname).match(/^\/blog\/([^/]+)$/);
  if (!match) return null;
  try { return blogLocaleForSlug(decodeURIComponent(match[1])); }
  catch { return null; }
}

export function languageForPath(pathname = '/') {
  pathname = normalizeLocalePath(pathname);
  if (pathname === '/bolivia-money-guide') return 'en';
  if (pathname === '/guia-dinero-bolivia') return 'es';
  return blogLocaleForPath(pathname)?.language || null;
}

export function languageForLocation({ pathname = '/', search = '' }) {
  const pathLanguage = languageForPath(pathname);
  if (pathLanguage) return pathLanguage;
  return new URLSearchParams(sanitizeLangSearch(search)).get('lang') === 'en' ? 'en' : 'es';
}

export function localizedLocation({ pathname = '/', search = '', hash = '' }, language) {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  const blogLocale = blogLocaleForPath(pathname);
  if (blogLocale) pathname = `/blog/${blogLocale.pair[language === 'en' ? 'en' : 'es']}`;
  const isGuide = ['/guia-dinero-bolivia', '/bolivia-money-guide'].includes(normalizeLocalePath(pathname));
  if (isGuide) {
    pathname = language === 'en' ? '/bolivia-money-guide' : '/guia-dinero-bolivia';
    params.delete('lang');
  } else if (language === 'en') params.set('lang', 'en');
  else params.delete('lang');
  const query = params.toString();
  return pathname + (query ? `?${query}` : '') + hash;
}
