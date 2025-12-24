import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initScrollDepthTracking, initTimeOnPageTracking } from '../utils/analytics';

/**
 * Hook to track page views, scroll depth, and time on page
 * Use this in your main App component or page components
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    const pagePath = location.pathname + location.search;
    const pageTitle = document.title || 'Bolivia Blue con Paz';
    
    trackPageView(pagePath, pageTitle);

    // Initialize scroll depth tracking
    const scrollCleanup = initScrollDepthTracking();

    // Initialize time on page tracking
    const timeCleanup = initTimeOnPageTracking(pagePath);

    // Cleanup on unmount or route change
    return () => {
      if (scrollCleanup) scrollCleanup();
      if (timeCleanup) timeCleanup();
    };
  }, [location]);
}

