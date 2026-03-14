/**
 * Reusable SEO structured data (JSON-LD) helpers for Bolivia Blue.
 * Use these so schema stays consistent and aligned with visible content.
 *
 * Convention:
 * - baseUrl: always https://boliviablue.com (no www)
 * - inLanguage: "es-BO" or "en-US"
 * - dateModified: ISO 8601; use real rate timestamp when available
 */

export const BASE_URL = 'https://boliviablue.com';

export const PUBLISHER_ORG = {
  '@type': 'Organization',
  name: 'Bolivia Blue con Paz',
  url: BASE_URL,
  logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` }
};

/**
 * WebPage schema for authority and freshness.
 * @param {Object} opts
 * @param {string} opts.name - Page title/name
 * @param {string} opts.description - Meta description
 * @param {string} opts.url - Canonical URL (path or full URL)
 * @param {string} [opts.dateModified] - ISO 8601 (e.g. rate timestamp)
 * @param {string} [opts.inLanguage] - "es-BO" | "en-US"
 * @param {object} [opts.mainEntity] - Optional main entity (e.g. FinancialProduct)
 */
export function getWebPage({ name, description, url, dateModified, inLanguage, mainEntity }) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    isPartOf: { '@type': 'WebSite', name: 'Bolivia Blue con Paz', url: BASE_URL },
    publisher: PUBLISHER_ORG
  };
  if (dateModified) page.dateModified = dateModified;
  if (inLanguage) page.inLanguage = inLanguage;
  if (mainEntity) page.mainEntity = mainEntity;
  return page;
}

/**
 * BreadcrumbList for navigation and rich results.
 * @param {Array<{ name: string, url: string }>} items - Path segments (name + path or full URL)
 */
export function getBreadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

/**
 * FAQPage schema. mainEntity = array of { "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }
 */
export function getFAQPage(mainEntity) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  };
}

/**
 * Dataset schema for data/archive pages (e.g. historical exchange rates).
 * @param {Object} opts
 * @param {string} opts.name
 * @param {string} opts.description
 * @param {string} opts.url - Canonical page URL
 * @param {string} [opts.datePublished] - e.g. "2024-01-01"
 * @param {string} [opts.dateModified] - ISO date or date-time
 * @param {string} [opts.inLanguage]
 * @param {string} [opts.updateFrequency] - e.g. "R/P15M" or "Updates every 15 minutes"
 * @param {object} [opts.temporalCoverage] - e.g. "2024-01-01/2025-12-31" or startDate/endDate
 * @param {object} [opts.variableMeasured] - e.g. { "@type": "PropertyValue", name: "USD/BOB exchange rate" }
 * @param {object} [opts.creator] - Organization
 */
export function getDataset({
  name,
  description,
  url,
  datePublished,
  dateModified,
  inLanguage,
  updateFrequency,
  temporalCoverage,
  variableMeasured,
  creator,
  distribution
}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: fullUrl,
    creator: creator || { '@type': 'Organization', name: 'Bolivia Blue con Paz', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'Bolivia Blue con Paz', url: BASE_URL }
  };
  if (datePublished) dataset.datePublished = datePublished;
  if (dateModified) dataset.dateModified = dateModified;
  if (inLanguage) dataset.inLanguage = inLanguage;
  if (updateFrequency) dataset.updateFrequency = updateFrequency;
  if (temporalCoverage) dataset.temporalCoverage = temporalCoverage;
  if (variableMeasured) dataset.variableMeasured = variableMeasured;
  if (distribution) dataset.distribution = distribution;
  return dataset;
}

/**
 * DataFeedItem for a single rate snapshot (use with DataFeed).
 * @param {Object} rate - { buy_bob_per_usd, sell_bob_per_usd, updated_at_iso }
 * @param {string} [dateModified] - ISO 8601; defaults to rate.updated_at_iso
 */
export function getDataFeedItem(rate, dateModified) {
  const ts = dateModified || rate?.updated_at_iso;
  const price = rate?.buy_bob_per_usd ?? rate?.buy;
  const item = {
    '@type': 'DataFeedItem',
    ...(ts && { dateModified: ts }),
    item: {
      '@type': 'ExchangeRateSpecification',
      currency: 'BOB',
      currentExchangeRate: {
        '@type': 'UnitPriceSpecification',
        price: price != null ? String(Number(price).toFixed(2)) : '0',
        priceCurrency: 'BOB',
        referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'USD' }
      }
    }
  };
  return item;
}
