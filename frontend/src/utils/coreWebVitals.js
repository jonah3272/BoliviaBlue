import { onCLS, onINP, onLCP } from 'web-vitals';
import { trackEvent } from './analytics';

let started = false;
export function startCoreWebVitals() {
  if (started || typeof window === 'undefined') return;
  started = true;
  // Web Vitals describe the document navigation, not subsequent SPA routes.
  // Exclude search/hash values and DOM attribution to avoid collecting user inputs.
  const pagePath = window.location.pathname;
  const report = metric => trackEvent('web_vital', {
    metric_name: metric.name,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
    page_path: pagePath,
    value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
    non_interaction: true,
  });
  onCLS(report); onINP(report); onLCP(report);
}
