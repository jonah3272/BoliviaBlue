import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPageView, initScrollDepthTracking, initTimeOnPageTracking } from '../utils/analytics';
import { analyticsTitleForPath } from '../utils/seoRateMeta';
import { analyticsPageLocation, sanitizeLangSearch } from '../utils/urlLang';

import { isPaymentCostGuide, waitForPaymentCostAnchor } from '../utils/paymentCostAnchor';

const IGNORED_HASHES = new Set(['google_vignette', 'aswift', 'google_ads']);

/**
 * Hook to track page views, scroll depth, and time on page.
 * Also scrolls to top on route change (SPAs don't do this by default).
 */
export function usePageTracking() {
  const location = useLocation();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const lastPageKeyRef = useRef('');
  const initialEntryRef = useRef({ ...location, settled: false });
  const lastHashLocationRef = useRef(null);
  useEffect(() => {
    // pushState navigation does not emit a native hashchange event. Optional
    // homepage sections own their post-mount scroll, including panel expansion.
    const previous = lastHashLocationRef.current;
    lastHashLocationRef.current = location;
    // Changing locale/query parameters is not a request to revisit the anchor.
    // A repeated same-URL navigation still is, and receives a new history key.
    const queryOnlyChange = previous && previous.pathname === location.pathname &&
      previous.hash === location.hash && previous.search !== location.search;
    if (location.pathname === '/' && !queryOnlyChange) window.dispatchEvent(new Event('bolivia-blue:home-hash'));
  }, [location.key, location.pathname, location.search, location.hash]);
  // A same-URL router navigation has a new key even when the tracking effect's
  // pathname/search/hash dependencies do not change. Cancel only this waiter.
  useEffect(() => {
    const initial = initialEntryRef.current;
    if (location.key !== initial.key) {
      initial.settled = true;
      initial.cancel?.();
    }
  }, [location.key]);

  useEffect(() => {
    let hashTimer;
    let paymentHashCleanup;
    const initial = initialEntryRef.current;
    const sameInitialEntry = ['key', 'pathname', 'search', 'hash'].every((key) => initial[key] === location[key]);
    if (!sameInitialEntry) initial.settled = true;
    const hashId = (location.hash || '').replace(/^#/, '');
    const isAdHash = IGNORED_HASHES.has(hashId);
    // These sections handle their own post-mount/expanded-state anchor scroll.
    let isDeferredHomeHash = false;
    try {
      isDeferredHomeHash = location.pathname === '/' &&
        ['home-history', 'home-sentiment', 'home-news'].includes(decodeURIComponent(hashId));
    } catch { /* Leave malformed hashes to the existing generic behavior. */ }

    if (isPaymentCostGuide(location) && sameInitialEntry) {
      if (!initial.settled) {
        paymentHashCleanup = waitForPaymentCostAnchor(() => { initial.settled = true; });
        initial.cancel = paymentHashCleanup;
      }
    } else if (location.hash && !isAdHash && !isDeferredHomeHash) {
      const scrollToHash = () => {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };
      if (!scrollToHash()) {
        hashTimer = window.setTimeout(scrollToHash, 100);
      }
    } else if (!location.hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    const pagePath = `${location.pathname}${sanitizeLangSearch(location.search)}`;
    const pageKey = `${pagePath}|${language}`;

    // Hash-only changes (AdSense vignettes, in-page anchors) must not mint a new page_view.
    if (lastPageKeyRef.current === pageKey) {
      return () => {
        if (hashTimer) window.clearTimeout(hashTimer);
        paymentHashCleanup?.();
      };
    }
    lastPageKeyRef.current = pageKey;

    const pageTitle = analyticsTitleForPath(location.pathname, language);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    trackPageView(pagePath, pageTitle, {
      page_location: analyticsPageLocation(origin, location.pathname, location.search),
    });

    const scrollCleanup = initScrollDepthTracking();
    const timeCleanup = initTimeOnPageTracking(pagePath);

    return () => {
      if (hashTimer) window.clearTimeout(hashTimer);
      paymentHashCleanup?.();
      if (scrollCleanup) scrollCleanup();
      if (timeCleanup) timeCleanup();
    };
  }, [location.pathname, location.search, location.hash, language]);
}
