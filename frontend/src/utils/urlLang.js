/**
 * Normalize language query strings.
 * Collapses malformed duplicates like `?lang=en?lang=en` that GA4 records as
 * separate page paths and that Google can index as competing URLs.
 */

export function sanitizeLangSearch(search) {
  const raw = String(search || '').replace(/^\?/, '');
  if (!raw) return '';

  const params = new URLSearchParams();
  for (const part of raw.split(/[&?]/)) {
    if (!part) continue;
    const eq = part.indexOf('=');
    let key = eq === -1 ? part : part.slice(0, eq);
    let value = eq === -1 ? '' : part.slice(eq + 1);
    try {
      key = decodeURIComponent(key);
      value = decodeURIComponent(value);
    } catch {
      /* keep raw */
    }
    if (!key) continue;
    params.set(key, value);
  }

  const lang = params.get('lang');
  if (lang !== 'en') params.delete('lang');

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Replace a malformed `?lang=` URL in-place without a navigation. */
export function applySanitizedLangUrl() {
  if (typeof window === 'undefined') return;
  const nextSearch = sanitizeLangSearch(window.location.search);
  const current = window.location.search || '';
  if (current === nextSearch) return;
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${nextSearch}${window.location.hash || ''}`
  );
}

/** Strip AdSense interstitial hashes so they are not counted as page views. */
export function analyticsPageLocation(origin, pathname, search) {
  const path = pathname || '/';
  const qs = sanitizeLangSearch(search);
  if (!origin) return `${path}${qs}`;
  return `${origin}${path}${qs}`;
}
