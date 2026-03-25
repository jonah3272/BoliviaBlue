/**
 * GA4 product events — consistent names for conversions and funnels.
 * Uses trackEvent from analytics.js (gtag). See ANALYTICS_EVENT_PLAN.md.
 */

import { trackEvent } from './analytics';

function baseParams(overrides = {}) {
  const path =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '';
  return {
    page_path: path,
    ...overrides,
  };
}

export function trackRateAlertOpened({ language }) {
  trackEvent('rate_alert_opened', baseParams({ language, page_type: 'rate_alert' }));
}

export function trackRateAlertSubmitted({ language, alert_type, direction, threshold }) {
  trackEvent('rate_alert_submitted', baseParams({
    language,
    page_type: 'rate_alert',
    alert_type,
    direction,
    threshold: threshold != null ? String(threshold) : undefined,
  }));
}

export function trackCalculatorUsed({ language, from_currency, to_currency, use_official }) {
  trackEvent('calculator_used', baseParams({
    language,
    page_type: 'calculator',
    from_currency,
    to_currency,
    use_official: use_official === true,
  }));
}

export function trackHistoricalDownloadCsv({ language, range, source }) {
  trackEvent('historical_download_csv', baseParams({
    language,
    page_type: 'historical',
    range_selected: range,
    format: 'csv',
    source: source || 'unknown',
  }));
}

export function trackHistoricalDownloadJson({ language, range, source }) {
  trackEvent('historical_download_json', baseParams({
    language,
    page_type: 'historical',
    range_selected: range,
    format: 'json',
    source: source || 'unknown',
  }));
}

export function trackComparisonPageViewed({ language }) {
  trackEvent('comparison_page_viewed', baseParams({ language, page_type: 'comparison' }));
}

export function trackMethodologyPageViewed({ language }) {
  trackEvent('methodology_page_viewed', baseParams({ language, page_type: 'methodology' }));
}

export function trackApiDocsViewed({ language }) {
  trackEvent('api_docs_viewed', baseParams({ language, page_type: 'api_docs' }));
}

export function trackMonthlyReportViewed({ language, report_month, report_year }) {
  trackEvent('monthly_report_viewed', baseParams({
    language,
    page_type: 'monthly_report',
    report_month: report_month != null ? String(report_month) : undefined,
    report_year: report_year != null ? String(report_year) : undefined,
  }));
}

export function trackChartRangeChanged({ language, range_previous, range_selected, chart_context }) {
  trackEvent('chart_range_changed', baseParams({
    language,
    range_previous,
    range_selected,
    chart_context: chart_context || 'blue_chart',
  }));
}

export function trackRelatedLinkClicked({ language, destination, link_label, page_type }) {
  trackEvent('related_link_clicked', baseParams({
    language,
    destination,
    link_label,
    page_type,
  }));
}

export function trackLanguageSwitched({ from_language, to_language }) {
  trackEvent('language_switched', baseParams({
    from_language,
    to_language,
    page_type: 'global',
  }));
}

export function trackNewsletterSignupStarted({ language, source }) {
  trackEvent('newsletter_signup_started', baseParams({ language, source: source || 'unknown' }));
}

export function trackNewsletterSignupCompleted({ language, source }) {
  trackEvent('newsletter_signup_completed', baseParams({ language, source: source || 'unknown' }));
}

export function trackOutboundSourceClicked({ language, destination, link_label }) {
  trackEvent('outbound_source_clicked', baseParams({
    language,
    destination,
    link_label: link_label || destination,
  }));
}
