import { useEffect } from 'react';
import { markPageAsReady, resetPageReadiness } from '../utils/adsenseLoader';

/**
 * Hook to signal to AdSense that a page has sufficient content
 * Use this in pages with substantial content to allow ads to load
 * 
 * Google AdSense Policy:
 * "We do not allow Google-served ads on screens without content or with low value content"
 * 
 * This hook ensures ads only load after content is rendered
 * 
 * @example
 * function MyPage() {
 *   useAdsenseReady(); // Call at the top of component
 *   // ... rest of component
 * }
 */
export function useAdsenseReady() {
  useEffect(() => {
    // Mark page as ready for ads
    markPageAsReady();
    
    // Cleanup: Reset on unmount
    return () => {
      resetPageReadiness();
    };
  }, []);
}

/**
 * Hook to delay AdSense until data is loaded
 * Use this in pages that fetch data before rendering content
 * 
 * @param {boolean} isLoading - Whether data is still loading
 * @param {boolean} hasContent - Whether the page has meaningful content
 * 
 * @example
 * function NewsPage() {
 *   const [news, setNews] = useState([]);
 *   const [isLoading, setIsLoading] = useState(true);
 *   
 *   useAdsenseReadyWhen(isLoading, news.length > 0);
 *   // ... rest of component
 * }
 */
export function useAdsenseReadyWhen(isLoading, hasContent) {
  useEffect(() => {
    // Only mark ready when loading is done AND we have content
    if (!isLoading && hasContent) {
      markPageAsReady();
    } else {
      resetPageReadiness();
    }
    
    return () => {
      resetPageReadiness();
    };
  }, [isLoading, hasContent]);
}

