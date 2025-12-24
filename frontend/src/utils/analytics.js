/**
 * Google Analytics 4 Event Tracking Utility
 * Comprehensive event tracking for boliviablue.com
 */

// Check if gtag is available
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track custom events with consistent parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!isGtagAvailable()) {
    // Silently fail in development or if GA is not loaded
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, eventParams);
    }
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...eventParams,
      // Add timestamp for debugging
      event_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
  }
};

/**
 * Track page views with custom parameters
 */
export const trackPageView = (pagePath, pageTitle, additionalParams = {}) => {
  if (!isGtagAvailable()) return;

  try {
    window.gtag('config', 'G-WRN4D234F2', {
      page_path: pagePath,
      page_title: pageTitle,
      ...additionalParams,
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
  }
};

// ============================================================================
// FINANCIAL/EXCHANGE RATE EVENTS
// ============================================================================

/**
 * Track rate card views/interactions
 */
export const trackRateCardView = (rateType, rate, currency = 'USD', isOfficial = false) => {
  trackEvent('rate_card_view', {
    rate_type: rateType, // 'buy' or 'sell'
    rate_value: rate,
    currency: currency,
    is_official: isOfficial,
    event_category: 'Exchange Rate',
    event_label: `${rateType}_${currency}`,
  });
};

/**
 * Track rate card interactions (clicks, hovers)
 */
export const trackRateCardInteraction = (rateType, action, currency = 'USD') => {
  trackEvent('rate_card_interaction', {
    rate_type: rateType,
    action: action, // 'click', 'hover', 'copy'
    currency: currency,
    event_category: 'Exchange Rate',
    event_label: `${action}_${rateType}`,
  });
};

/**
 * Track rate updates
 */
export const trackRateUpdate = (buyRate, sellRate, currency = 'USD', source = 'api') => {
  trackEvent('rate_update', {
    buy_rate: buyRate,
    sell_rate: sellRate,
    currency: currency,
    source: source,
    event_category: 'Exchange Rate',
  });
};

/**
 * Track official rate toggle
 */
export const trackOfficialRateToggle = (showOfficial) => {
  trackEvent('official_rate_toggle', {
    show_official: showOfficial,
    event_category: 'Exchange Rate',
    event_label: showOfficial ? 'show' : 'hide',
  });
};

// ============================================================================
// CALCULATOR EVENTS
// ============================================================================

/**
 * Track calculator usage
 */
export const trackCalculatorUsage = (fromAmount, fromCurrency, toCurrency, result) => {
  trackEvent('calculator_usage', {
    from_amount: fromAmount,
    from_currency: fromCurrency,
    to_currency: toCurrency,
    result_amount: result,
    event_category: 'Calculator',
    event_label: `${fromCurrency}_to_${toCurrency}`,
    value: parseFloat(result) || 0,
  });
};

/**
 * Track calculator currency switch
 */
export const trackCalculatorCurrencySwitch = (fromCurrency, toCurrency) => {
  trackEvent('calculator_currency_switch', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    event_category: 'Calculator',
    event_label: `${fromCurrency}_to_${toCurrency}`,
  });
};

/**
 * Track calculator swap (reverse currencies)
 */
export const trackCalculatorSwap = () => {
  trackEvent('calculator_swap', {
    event_category: 'Calculator',
    event_label: 'swap_currencies',
  });
};

// ============================================================================
// CHART EVENTS
// ============================================================================

/**
 * Track chart interactions
 */
export const trackChartInteraction = (action, chartType, timeRange = null) => {
  trackEvent('chart_interaction', {
    action: action, // 'view', 'zoom', 'pan', 'hover', 'click'
    chart_type: chartType, // 'line', 'candlestick', 'bar'
    time_range: timeRange, // '1d', '7d', '30d', '1y', 'all'
    event_category: 'Charts',
    event_label: `${action}_${chartType}`,
  });
};

/**
 * Track chart time range changes
 */
export const trackChartTimeRangeChange = (fromRange, toRange, chartType) => {
  trackEvent('chart_time_range_change', {
    from_range: fromRange,
    to_range: toRange,
    chart_type: chartType,
    event_category: 'Charts',
    event_label: `${fromRange}_to_${toRange}`,
  });
};

// ============================================================================
// NEWS & CONTENT EVENTS
// ============================================================================

/**
 * Track news article clicks
 */
export const trackNewsClick = (articleTitle, source, articleUrl) => {
  trackEvent('news_click', {
    article_title: articleTitle,
    article_source: source,
    article_url: articleUrl,
    event_category: 'News',
    event_label: source,
  });
};

/**
 * Track news article views
 */
export const trackNewsView = (articleTitle, source) => {
  trackEvent('news_view', {
    article_title: articleTitle,
    article_source: source,
    event_category: 'News',
    event_label: source,
  });
};

/**
 * Track blog article views
 */
export const trackBlogView = (articleTitle, articleSlug, category) => {
  trackEvent('blog_view', {
    article_title: articleTitle,
    article_slug: articleSlug,
    article_category: category,
    event_category: 'Blog',
    event_label: articleSlug,
  });
};

/**
 * Track content engagement (time spent reading)
 */
export const trackContentEngagement = (contentType, contentId, timeSpent) => {
  trackEvent('content_engagement', {
    content_type: contentType, // 'article', 'blog', 'news'
    content_id: contentId,
    time_spent_seconds: timeSpent,
    event_category: 'Content',
    event_label: contentType,
    value: Math.round(timeSpent),
  });
};

// ============================================================================
// ALERT EVENTS
// ============================================================================

/**
 * Track alert form submission
 */
export const trackAlertSubmission = (alertType, threshold, direction, currency = 'USD') => {
  trackEvent('alert_submission', {
    alert_type: alertType, // 'buy', 'sell', 'both'
    threshold: threshold,
    direction: direction, // 'above', 'below'
    currency: currency,
    event_category: 'Alerts',
    event_label: `${alertType}_${direction}`,
    value: parseFloat(threshold) || 0,
  });
};

/**
 * Track alert form start (user begins filling form)
 */
export const trackAlertFormStart = () => {
  trackEvent('alert_form_start', {
    event_category: 'Alerts',
    event_label: 'form_started',
  });
};

/**
 * Track alert form abandonment
 */
export const trackAlertFormAbandonment = (step, fieldsCompleted) => {
  trackEvent('alert_form_abandonment', {
    step: step,
    fields_completed: fieldsCompleted,
    event_category: 'Alerts',
    event_label: `abandoned_at_${step}`,
  });
};

// ============================================================================
// SOCIAL SHARING EVENTS
// ============================================================================

/**
 * Track social share actions
 */
export const trackSocialShare = (platform, contentType, contentId) => {
  trackEvent('social_share', {
    platform: platform, // 'facebook', 'twitter', 'whatsapp', 'telegram', 'copy'
    content_type: contentType, // 'rate', 'article', 'page'
    content_id: contentId,
    event_category: 'Social',
    event_label: platform,
  });
};

// ============================================================================
// NAVIGATION EVENTS
// ============================================================================

/**
 * Track navigation clicks
 */
export const trackNavigation = (destination, linkText, linkType = 'internal') => {
  trackEvent('navigation_click', {
    destination: destination,
    link_text: linkText,
    link_type: linkType, // 'internal', 'external'
    event_category: 'Navigation',
    event_label: linkText,
  });
};

/**
 * Track language switch
 */
export const trackLanguageSwitch = (fromLang, toLang) => {
  trackEvent('language_switch', {
    from_language: fromLang,
    to_language: toLang,
    event_category: 'User Preferences',
    event_label: `${fromLang}_to_${toLang}`,
  });
};

/**
 * Track currency switch
 */
export const trackCurrencySwitch = (fromCurrency, toCurrency) => {
  trackEvent('currency_switch', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    event_category: 'User Preferences',
    event_label: `${fromCurrency}_to_${toCurrency}`,
  });
};

/**
 * Track theme switch (dark/light mode)
 */
export const trackThemeSwitch = (fromTheme, toTheme) => {
  trackEvent('theme_switch', {
    from_theme: fromTheme,
    to_theme: toTheme,
    event_category: 'User Preferences',
    event_label: `${fromTheme}_to_${toTheme}`,
  });
};

// ============================================================================
// SEARCH EVENTS
// ============================================================================

/**
 * Track search queries
 */
export const trackSearch = (searchQuery, resultsCount = 0) => {
  trackEvent('search', {
    search_term: searchQuery,
    results_count: resultsCount,
    event_category: 'Search',
    event_label: searchQuery,
  });
};

/**
 * Track search result clicks
 */
export const trackSearchResultClick = (searchQuery, resultTitle, position) => {
  trackEvent('search_result_click', {
    search_term: searchQuery,
    result_title: resultTitle,
    result_position: position,
    event_category: 'Search',
    event_label: searchQuery,
  });
};

// ============================================================================
// ENGAGEMENT EVENTS
// ============================================================================

/**
 * Track scroll depth
 */
export const trackScrollDepth = (depth) => {
  // Only track milestones (25%, 50%, 75%, 100%)
  const milestones = [25, 50, 75, 100];
  if (milestones.includes(depth)) {
    trackEvent('scroll_depth', {
      depth_percentage: depth,
      event_category: 'Engagement',
      event_label: `${depth}%`,
    });
  }
};

/**
 * Track time on page
 */
export const trackTimeOnPage = (timeInSeconds, pagePath) => {
  // Track at milestones: 30s, 1min, 2min, 5min, 10min
  const milestones = [30, 60, 120, 300, 600];
  if (milestones.includes(timeInSeconds)) {
    trackEvent('time_on_page', {
      time_seconds: timeInSeconds,
      page_path: pagePath,
      event_category: 'Engagement',
      event_label: `${timeInSeconds}s`,
      value: timeInSeconds,
    });
  }
};

/**
 * Track video plays
 */
export const trackVideoPlay = (videoTitle, videoUrl) => {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_url: videoUrl,
    event_category: 'Video',
    event_label: videoTitle,
  });
};

/**
 * Track video completion
 */
export const trackVideoComplete = (videoTitle, videoUrl, duration) => {
  trackEvent('video_complete', {
    video_title: videoTitle,
    video_url: videoUrl,
    video_duration: duration,
    event_category: 'Video',
    event_label: videoTitle,
    value: duration,
  });
};

// ============================================================================
// FORM EVENTS
// ============================================================================

/**
 * Track form submissions
 */
export const trackFormSubmission = (formName, formType, success = true) => {
  trackEvent('form_submission', {
    form_name: formName,
    form_type: formType, // 'contact', 'newsletter', 'alert', 'feedback'
    success: success,
    event_category: 'Forms',
    event_label: formName,
  });
};

/**
 * Track form errors
 */
export const trackFormError = (formName, errorType, errorMessage) => {
  trackEvent('form_error', {
    form_name: formName,
    error_type: errorType,
    error_message: errorMessage,
    event_category: 'Forms',
    event_label: `${formName}_${errorType}`,
  });
};

/**
 * Track form field focus
 */
export const trackFormFieldFocus = (formName, fieldName) => {
  trackEvent('form_field_focus', {
    form_name: formName,
    field_name: fieldName,
    event_category: 'Forms',
    event_label: `${formName}_${fieldName}`,
  });
};

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track JavaScript errors
 */
export const trackError = (errorMessage, errorType, errorLocation) => {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    error_type: errorType,
    error_location: errorLocation,
    event_category: 'Errors',
    event_label: errorType,
  });
};

/**
 * Track API errors
 */
export const trackApiError = (endpoint, errorMessage, statusCode) => {
  trackEvent('api_error', {
    endpoint: endpoint,
    error_message: errorMessage,
    status_code: statusCode,
    event_category: 'API',
    event_label: endpoint,
  });
};

// ============================================================================
// CONVERSION EVENTS
// ============================================================================

/**
 * Track conversions (key actions)
 */
export const trackConversion = (conversionType, value = 0, currency = 'USD') => {
  trackEvent('conversion', {
    conversion_type: conversionType, // 'alert_signup', 'newsletter_signup', 'calculator_use'
    value: value,
    currency: currency,
    event_category: 'Conversions',
    event_label: conversionType,
  });
};

/**
 * Track user engagement milestones
 */
export const trackEngagementMilestone = (milestone) => {
  trackEvent('engagement_milestone', {
    milestone: milestone, // 'first_visit', 'returning_user', 'power_user'
    event_category: 'Engagement',
    event_label: milestone,
  });
};

// ============================================================================
// AD EVENTS (AdSense)
// ============================================================================

/**
 * Track ad impressions
 */
export const trackAdImpression = (adSlot, adFormat) => {
  trackEvent('ad_impression', {
    ad_slot: adSlot,
    ad_format: adFormat,
    event_category: 'Ads',
    event_label: adSlot,
  });
};

/**
 * Track ad clicks
 */
export const trackAdClick = (adSlot, adFormat) => {
  trackEvent('ad_click', {
    ad_slot: adSlot,
    ad_format: adFormat,
    event_category: 'Ads',
    event_label: adSlot,
  });
};

// ============================================================================
// PERFORMANCE EVENTS
// ============================================================================

/**
 * Track page load performance
 */
export const trackPageLoad = (loadTime, pagePath) => {
  trackEvent('page_load', {
    load_time_ms: loadTime,
    page_path: pagePath,
    event_category: 'Performance',
    event_label: pagePath,
    value: Math.round(loadTime),
  });
};

/**
 * Track API response times
 */
export const trackApiPerformance = (endpoint, responseTime, success = true) => {
  trackEvent('api_performance', {
    endpoint: endpoint,
    response_time_ms: responseTime,
    success: success,
    event_category: 'Performance',
    event_label: endpoint,
    value: Math.round(responseTime),
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize scroll depth tracking
 */
export const initScrollDepthTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const trackedDepths = new Set();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      // Track milestones
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
          trackedDepths.add(milestone);
          trackScrollDepth(milestone);
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Initialize time on page tracking
 */
export const initTimeOnPageTracking = (pagePath) => {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();
  const milestones = [30, 60, 120, 300, 600];
  const trackedMilestones = new Set();

  const checkTime = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    milestones.forEach(milestone => {
      if (timeSpent >= milestone && !trackedMilestones.has(milestone)) {
        trackedMilestones.add(milestone);
        trackTimeOnPage(milestone, pagePath);
      }
    });
  };

  const interval = setInterval(checkTime, 5000); // Check every 5 seconds

  // Track on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    trackTimeOnPage(finalTime, pagePath);
  });

  return () => {
    clearInterval(interval);
  };
};

/**
 * Set user properties (for segmentation)
 */
export const setUserProperty = (propertyName, propertyValue) => {
  if (!isGtagAvailable()) return;

  try {
    window.gtag('set', 'user_properties', {
      [propertyName]: propertyValue,
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
  }
};

