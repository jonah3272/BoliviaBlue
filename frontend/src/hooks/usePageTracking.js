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

    if (isPaymentCostGuide(location) && sameInitialEntry) {
      if (!initial.settled) {
        paymentHashCleanup = waitForPaymentCostAnchor(() => { initial.settled = true; });
        initial.cancel = paymentHashCleanup;
      }
    } else if (location.hash && !isAdHash) {
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
