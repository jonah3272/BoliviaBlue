/**
 * AdSense Loader - Only loads ads when meaningful content is present
 * This prevents ads from loading on loading screens, error pages, or empty states
 * 
 * Google AdSense Policy Requirement:
 * "We do not allow Google-served ads on screens without content or with low value content"
 */

const MIN_CONTENT_LENGTH = 500; // Minimum characters of actual content
const MIN_MEANINGFUL_ELEMENTS = 3; // Minimum number of content elements
const MAX_CHECKS = 10; // Maximum number of content checks
const CHECK_INTERVAL = 500; // Check every 500ms

// Routes that should NEVER show ads (redirect pages, thin content, etc.)
const EXCLUDED_ROUTES = [
  // Redirect pages (zero content, just redirects)
  '/calculator',
  '/news',
  '/about',
  '/contact',
  '/faq',
  '/comparison',
  '/buy-dollars',
  '/bolivia-blue-rate-hoy',
  '/bolivia-blue-rate-actual',
  '/tipo-cambio-blue-bolivia',
  '/cuanto-esta-dolar-bolivia-hoy',
  // Add any other redirect or thin-content pages here
];

/**
 * Checks if the current route should be excluded from AdSense
 * @returns {boolean} True if route should be excluded
 */
function isRouteExcluded() {
  const currentPath = window.location.pathname;
  
  // Check exact matches
  if (EXCLUDED_ROUTES.includes(currentPath)) {
    console.log('[AdSense] Route excluded:', currentPath);
    return true;
  }
  
  // Check if path starts with any excluded route pattern
  for (const excludedRoute of EXCLUDED_ROUTES) {
    if (currentPath.startsWith(excludedRoute)) {
      console.log('[AdSense] Route pattern excluded:', currentPath);
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if the page has minimum content to display ads
 * @returns {boolean} True if page has sufficient content for AdSense
 */
export function hasMinimumContent() {
  // Check 0: Route-based exclusions (check first, fastest)
  if (isRouteExcluded()) {
    console.log('[AdSense] Route is in exclusion list, blocking ads');
    return false;
  }
  
  // Check 1: Detect loading screens/spinners
  const loadingElements = document.querySelectorAll('[class*="animate-spin"], [data-loading-state="true"], [data-adsense-block]');
  if (loadingElements.length > 0) {
    console.log('[AdSense] Loading screen detected, blocking ads');
    return false;
  }

  // Check 2: Check if page explicitly signals it has content
  if (document.body.getAttribute('data-has-sufficient-content') === 'true') {
    console.log('[AdSense] Page marked with sufficient content flag');
    return true;
  }

  // Check 3: Check for minimum text content (excluding scripts, styles, navigation)
  const bodyText = document.body.innerText || '';
  const meaningfulText = bodyText.replace(/\s+/g, ' ').trim();
  if (meaningfulText.length < MIN_CONTENT_LENGTH) {
    console.log('[AdSense] Insufficient content length:', meaningfulText.length, '/', MIN_CONTENT_LENGTH);
    return false;
  }

  // Check 4: Check for meaningful content elements (articles, sections, main content)
  const contentElements = document.querySelectorAll('article, section[class*="content"], main, .prose, [role="article"], [role="main"]');
  if (contentElements.length < MIN_MEANINGFUL_ELEMENTS) {
    console.log('[AdSense] Insufficient content elements:', contentElements.length, '/', MIN_MEANINGFUL_ELEMENTS);
    return false;
  }

  // Check 5: Check if main content area has rendered with actual content
  const mainContent = document.querySelector('main');
  if (!mainContent) {
    console.log('[AdSense] Main content area not found');
    return false;
  }

  // Check if main has more than just loading indicators
  const mainText = mainContent.innerText || '';
  if (mainText.length < 200) {
    console.log('[AdSense] Main content has insufficient text:', mainText.length, 'chars');
    return false;
  }

  // Check 6: Ensure we're not on an error page
  const errorIndicators = document.querySelectorAll('[class*="error"], [class*="404"], [class*="not-found"]');
  if (errorIndicators.length > 0) {
    const errorText = document.body.innerText.toLowerCase();
    if (errorText.includes('error') || errorText.includes('not found') || errorText.includes('404')) {
      console.log('[AdSense] Error page detected, blocking ads');
      return false;
    }
  }

  console.log('[AdSense] ✓ Sufficient content detected, allowing ads');
  return true;
}

/**
 * Loads AdSense script only when sufficient content is present
 * @param {string} publisherId - Google AdSense publisher ID (e.g., 'ca-pub-XXXXXXXXXXXXXXXX')
 */
export function loadAdSense(publisherId) {
  // Don't load if already loaded
  if (document.querySelector('script[src*="adsbygoogle"]')) {
    console.log('[AdSense] Script already loaded, skipping');
    return;
  }

  let checkCount = 0;

  const checkAndLoad = () => {
    checkCount++;
    console.log(`[AdSense] Content check ${checkCount}/${MAX_CHECKS}`);

    if (hasMinimumContent()) {
      // Content is ready, load AdSense
      console.log('[AdSense] 🎯 Loading AdSense script...');
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', publisherId);
      
      script.onload = () => {
        console.log('[AdSense] ✓ Script loaded successfully');
      };
      
      script.onerror = () => {
        console.error('[AdSense] ✗ Failed to load script');
      };
      
      document.head.appendChild(script);
    } else if (checkCount < MAX_CHECKS) {
      // Content not ready, check again
      console.log(`[AdSense] Content not ready, checking again in ${CHECK_INTERVAL}ms...`);
      setTimeout(checkAndLoad, CHECK_INTERVAL);
    } else {
      // Max checks reached, don't load ads
      console.warn('[AdSense] ⚠ Max content checks reached. Ads not loaded - insufficient content detected.');
      console.warn('[AdSense] This is correct behavior if the page has minimal content (loading screens, error pages, etc.)');
    }
  };

  // Start checking
  console.log('[AdSense] 🚀 Starting content validation...');
  checkAndLoad();
}

/**
 * Prevents ads from loading on specific pages
 * Call this at the top of pages that should never show ads
 */
export function blockAdsOnThisPage() {
  document.body.setAttribute('data-adsense-block', 'true');
  console.log('[AdSense] Ads blocked on this page by developer request');
}

/**
 * Signals that a page has sufficient content for ads
 * Call this in useEffect of pages with substantial content
 */
export function markPageAsReady() {
  // Remove loading state if present
  document.body.removeAttribute('data-loading-state');
  
  // Mark as having sufficient content
  document.body.setAttribute('data-has-sufficient-content', 'true');
  console.log('[AdSense] Page marked as ready for ads');
}

/**
 * Resets page readiness state
 * Call this when navigating away from a page
 */
export function resetPageReadiness() {
  document.body.removeAttribute('data-has-sufficient-content');
  console.log('[AdSense] Page readiness state reset');
}

