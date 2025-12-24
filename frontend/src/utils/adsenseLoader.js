/**
 * AdSense Loader - Only loads ads when meaningful content is present
 * This prevents ads from loading on loading screens, error pages, or empty states
 * 
 * Google AdSense Policy Requirement:
 * "We do not allow Google-served ads on screens without content or with low value content"
 */

// AdSense requires substantial content - Google recommends 800-1000+ words per page
// 800 words ≈ 4000-5000 characters (average 5 chars per word + spaces)
// We use 4000 characters as minimum to ensure quality content
const MIN_CONTENT_LENGTH = 4000; // Minimum characters (≈800 words) for AdSense quality
const MIN_MEANINGFUL_ELEMENTS = 5; // Minimum number of content elements (increased for quality)
const MAX_CHECKS = 15; // Increased checks to ensure content is fully rendered
const CHECK_INTERVAL = 500; // Check every 500ms

// Routes that should NEVER show ads (redirect pages, utility pages, etc.)
// NOTE: Only exclude pages that are truly redirects or utility pages with no content
// DO NOT exclude legitimate content pages - they need ads!
const EXCLUDED_ROUTES = [
  // Utility pages (no content, just functionality)
  '/unsubscribe',
  // Redirect-only pages (these should redirect immediately, no content rendered)
  // Note: These are handled by React Router redirects, but listed here as safety
  '/calculator', // Redirects to /calculadora
  '/news', // Redirects to /noticias
  '/about', // Redirects to /acerca-de
  '/contact', // Redirects to /contacto
  '/faq', // Redirects to /preguntas-frecuentes
  '/comparison', // Redirects to /comparacion
  '/buy-dollars', // Redirects to /comprar-dolares
  // Duplicate pages that redirect
  '/bolivia-blue-rate-hoy',
  '/bolivia-blue-rate-actual',
  '/tipo-cambio-blue-bolivia',
  '/cuanto-esta-dolar-bolivia-hoy',
  '/blue-dolar-bolivia', // Redirects to /bolivian-blue
  '/blue-rate-bolivia', // Redirects to /bolivian-blue
  '/cambio-blue-bolivia', // Redirects to /bolivian-blue
  '/bolivia-blue-rate', // Redirects to /bolivian-blue
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

  // Check 3: Check for minimum text content (EXCLUDING navigation, header, footer, buttons)
  // Google AdSense wants PUBLISHER CONTENT, not UI elements
  const nav = document.querySelector('nav, header, [role="navigation"]');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  
  // Clone body to exclude navigation elements
  const bodyClone = document.body.cloneNode(true);
  
  // Remove navigation, header, footer, buttons, and other UI elements
  const elementsToRemove = bodyClone.querySelectorAll(
    'nav, header, footer, [role="navigation"], [role="banner"], [role="contentinfo"], ' +
    'button, .btn, [class*="button"], [class*="nav"], [class*="menu"], ' +
    'script, style, noscript, [hidden], [aria-hidden="true"]'
  );
  elementsToRemove.forEach(el => el.remove());
  
  // Get text from main content area only
  const mainContent = document.querySelector('main');
  if (!mainContent) {
    console.log('[AdSense] Main content area not found');
    return false;
  }
  
  // Clone main and remove UI elements
  const mainClone = mainContent.cloneNode(true);
  const mainUIElements = mainClone.querySelectorAll(
    'button, .btn, [class*="button"], nav, header, footer, ' +
    '[class*="nav"], [class*="menu"], [role="navigation"], [role="banner"], [role="contentinfo"]'
  );
  mainUIElements.forEach(el => el.remove());
  
  // Get meaningful text from main content only (excluding UI)
  const mainText = mainClone.innerText || '';
  const meaningfulText = mainText.replace(/\s+/g, ' ').trim();
  
  // Also check for breadcrumbs and remove them (they're navigation, not content)
  const breadcrumbText = meaningfulText.match(/Inicio|Home|Calculadora|Calculator|Noticias|News/gi);
  const textWithoutBreadcrumbs = meaningfulText.replace(/Inicio|Home|Calculadora|Calculator|Noticias|News/gi, '').trim();
  
  // Use the text without breadcrumbs for final check
  const finalText = textWithoutBreadcrumbs.length > meaningfulText.length * 0.8 
    ? textWithoutBreadcrumbs 
    : meaningfulText;
  
  if (finalText.length < MIN_CONTENT_LENGTH) {
    console.log('[AdSense] Insufficient content length (excluding nav/header/footer):', finalText.length, '/', MIN_CONTENT_LENGTH);
    return false;
  }

  // Check 4: Check for meaningful content elements (articles, sections, main content)
  // Only count elements within main, not navigation/header/footer
  const contentElements = mainContent.querySelectorAll('article, section, .prose, [role="article"]');
  if (contentElements.length < MIN_MEANINGFUL_ELEMENTS) {
    console.log('[AdSense] Insufficient content elements in main:', contentElements.length, '/', MIN_MEANINGFUL_ELEMENTS);
    return false;
  }

  // Check 5: Verify main content has substantial text (redundant check for safety)
  // This ensures we have enough content even after all filtering
  const mainTextCheck = mainContent.innerText || '';
  const mainTextClean = mainTextCheck
    .replace(/Inicio|Home|Calculadora|Calculator|Noticias|News|Contacto|Contact|Acerca de|About|Breadcrumb|Navegación|Navigation/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (mainTextClean.length < 1000) {
    console.log('[AdSense] Main content has insufficient text (after removing nav):', mainTextClean.length, 'chars (minimum 1000)');
    return false;
  }

  // Check 6: Ensure we're not on an error page
  // Check for error boundary components, error classes, and error text
  const errorBoundary = document.querySelector('.error-boundary, [data-adsense-block="error-page"]');
  const errorIndicators = document.querySelectorAll('[class*="error"], [class*="404"], [class*="not-found"], .error-boundary');
  if (errorBoundary || errorIndicators.length > 0) {
    const errorText = document.body.innerText.toLowerCase();
    if (errorText.includes('error') || errorText.includes('not found') || errorText.includes('404') || errorText.includes('algo salió mal') || errorText.includes('failed to load')) {
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

