import { useEffect, useState } from 'react';
import { homeMarketSummary } from '../utils/homeMarketSummary.js';

function initialReport() {
  try { return JSON.parse(document.getElementById('home-market-summary-data')?.textContent || 'null'); }
  catch { return null; }
}

export default function HomeMarketSummary({ language = 'es' }) {
  const [report, setReport] = useState(initialReport);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    let active = true;
    Promise.resolve().then(() => fetch('/api/daily-report?view=home-summary', { signal: controller.signal }))
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Summary unavailable')))
      .then(payload => { if (active) setReport(payload.report || null); })
      .catch(() => { /* Keep the dated immutable server snapshot, if present. */ })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  const model = homeMarketSummary(report, language);
  if (!model) return null;
  return <section data-home-market-summary className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 space-y-2">
    <h2 className="font-semibold text-gray-900 dark:text-white">{model.heading}</h2>
    <p>{model.summary} {model.change}</p>
    <p className="text-xs text-gray-600 dark:text-gray-400">{model.caveat}</p>
    <a className="text-emerald-700 dark:text-emerald-300 underline" href={model.href}>{model.link}</a>
  </section>;
}
