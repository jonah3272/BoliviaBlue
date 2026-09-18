import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPageView, initScrollDepthTracking, initTimeOnPageTracking } from '../utils/analytics';
import { analyticsTitleForPath } from '../utils/seoRateMeta';
import { analyticsPageLocation, sanitizeLangSearch } from '../utils/urlLang';

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

  useEffect(() => {
    let hashTimer;
    const hashId = (location.hash || '').replace(/^#/, '');
    const isAdHash = IGNORED_HASHES.has(hashId);

    if (location.hash && !isAdHash) {
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
      if (scrollCleanup) scrollCleanup();
      if (timeCleanup) timeCleanup();
    };
  }, [location.pathname, location.search, location.hash, language]);
}
