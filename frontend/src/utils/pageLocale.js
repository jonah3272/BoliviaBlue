import { sanitizeLangSearch } from './urlLang.js';

export const normalizeLocalePath = (pathname = '/') => pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';

export function languageForLocation({ pathname = '/', search = '' }) {
  pathname = normalizeLocalePath(pathname);
  if (pathname === '/bolivia-money-guide') return 'en';
  if (pathname === '/guia-dinero-bolivia') return 'es';
  return new URLSearchParams(sanitizeLangSearch(search)).get('lang') === 'en' ? 'en' : 'es';
}

export function localizedLocation({ pathname = '/', search = '', hash = '' }, language) {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  const isGuide = ['/guia-dinero-bolivia', '/bolivia-money-guide'].includes(normalizeLocalePath(pathname));
  if (isGuide) {
    pathname = language === 'en' ? '/bolivia-money-guide' : '/guia-dinero-bolivia';
    params.delete('lang');
  } else if (language === 'en') params.set('lang', 'en');
  else params.delete('lang');
  const query = params.toString();
  return pathname + (query ? `?${query}` : '') + hash;
}
