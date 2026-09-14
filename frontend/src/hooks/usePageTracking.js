import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPageView, initScrollDepthTracking, initTimeOnPageTracking } from '../utils/analytics';
import { analyticsTitleForPath } from '../utils/seoRateMeta';

/**
 * Hook to track page views, scroll depth, and time on page.
 * Also scrolls to top on route change (SPAs don't do this by default).
 */
export function usePageTracking() {
  const location = useLocation();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  useEffect(() => {
    let hashTimer;

    if (location.hash) {
      const id = location.hash.replace('#', '');
      const scrollToHash = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };
      if (!scrollToHash()) {
        hashTimer = window.setTimeout(scrollToHash, 100);
      }
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    const pagePath = location.pathname + location.search;
    const pageTitle = analyticsTitleForPath(location.pathname, language);

    trackPageView(pagePath, pageTitle);

    const scrollCleanup = initScrollDepthTracking();
    const timeCleanup = initTimeOnPageTracking(pagePath);

    return () => {
      if (hashTimer) window.clearTimeout(hashTimer);
      if (scrollCleanup) scrollCleanup();
      if (timeCleanup) timeCleanup();
    };
  }, [location, language]);
}
