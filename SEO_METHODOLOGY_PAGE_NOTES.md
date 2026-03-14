# Methodology & Data Source Page – Implementation Notes

This document describes the strengthened methodology and data transparency page for Bolivia Blue (boliviablue.com). The work is additive and improves trust, authority, and citation value for users, journalists, developers, and search engines.

---

## Route used

**`/fuente-de-datos`** – The existing Data Source page was extended. No new route or duplicate page was created. The same component (`DataSource.jsx`) and path are used so that existing links and SEO equity are preserved.

---

## Sections added or improved

| Section | Change |
|--------|--------|
| **Header / H1** | Reframed as "Methodology & Data Source" (ES: "Metodología y Fuente de Datos"). Intro paragraph now states what the page explains and who it is for (journalists, researchers, developers). |
| **What is the Bolivia Blue rate** | **New.** Explains the blue dollar (parallel dollar) in Bolivia, that it reflects the real P2P market price, and that Bolivia Blue tracks it via Binance P2P. |
| **Data source** | **New.** States that only public Binance P2P data is used (USDT/BOB), no social or other platforms for the main quote. Describes Binance P2P as verifiable and widely used. |
| **How the rate is calculated** | **New.** Describes the actual implementation: sample of BUY and SELL offers for USDT/BOB, median (not average) for each side; buy rate = median of buy offers, sell rate = median of sell offers; "mid" = midpoint between buy and sell. Notes USDT ≈ 1 USD for quoting. |
| **Update frequency** | **New.** States updates every 15 minutes; each cycle queries Binance P2P, computes medians, stores a record; last update time shown on homepage and in API. |
| **Blue vs official rate** | **New.** Explains official rate (BCB, banks) vs blue (parallel P2P); that both are shown and not mixed; link to comparison page. |
| **Historical data and downloads** | **New.** Explains that each update is stored; points to historical data page, CSV/JSON export by range, and monthly reports with internal links. |
| **Summary of our data** | **Improved.** Kept as a short bullet list (was "About Our Data") summarizing: 15 min updates, Binance P2P USDT/BOB, median, history available, transparent. |
| **API and developer use** | **New.** Replaces old "API Access" block. Documents programmatic access, correct endpoint `GET .../api/blue-rate`, link to API docs. |
| **How to cite Bolivia Blue** | **Improved.** Dedicated section with recommended one-liner: "Source: Bolivia Blue, boliviablue.com, updated every 15 minutes." (ES/EN). Alternatives mentioned. |
| **Limitations and transparency** | **New.** Replaces generic disclaimer. States: data is an estimate from Binance P2P; not financial advice; users should verify before transacting; real P2P price can vary; possible delay if P2P returns insufficient offers. |
| **FAQ** | **New.** Four questions with visible answers, used for FAQPage schema: source of data, update frequency, blue vs official, use in articles/research. |
| **Media contact** | **Kept.** Unchanged; contact for custom data, API, interviews, exports. |
| **Quick links** | **Improved.** Now includes: current rate, historical data, API docs, comparison, monthly reports, "What is blue dollar", about. Removed redundant "Financial News" and "Historical Charts" in favor of clearer labels. |

---

## Files changed

| File | Change |
|------|--------|
| `frontend/src/pages/DataSource.jsx` | Imports `BASE_URL`, `getWebPage`, `getBreadcrumbList`, `getFAQPage` from `seoSchema`. Added/rewrote sections above; fixed API URL to `.../api/blue-rate`; added FAQ array and FAQ schema; improved metadata and structured data. |
| `SEO_METHODOLOGY_PAGE_NOTES.md` | This file (new). |

No backend or routing changes. No changes to rate calculation, Supabase, or analytics.

---

## Methodology statements included

All of the following are aligned with the current implementation (backend and scheduler):

- **Source:** Public Binance P2P data only (USDT/BOB pair); no other platforms for the main quote.
- **Calculation:** Median of buy offers (buy rate), median of sell offers (sell rate); mid = midpoint between buy and sell. Median used to reduce impact of outliers.
- **Update frequency:** Every 15 minutes; each cycle queries Binance P2P, computes medians, stores one record.
- **Official rate:** Sourced separately (BCB or fallback); shown alongside blue; not mixed with blue.
- **Historical:** Each update is stored; historical data and CSV/JSON exports are available.
- **Limitations:** Data is an estimate of the parallel market; not financial advice; users should verify before transacting; real P2P price can vary; updates may be delayed if P2P returns insufficient offers.

---

## Internal links added

- **Homepage:** `/` (current rate).
- **Historical data:** `/datos-historicos` (multiple mentions: section + quick links).
- **API docs:** `/api-docs` (API section + quick links).
- **Comparison:** `/comparacion` (blue vs official section + quick links).
- **Monthly reports:** `/reporte-mensual/1/2025` (historical section + quick links). Note: there is no index route for all reports; this links to an example report.
- **What is blue dollar:** `/que-es-dolar-blue` (quick links).
- **About:** `/acerca-de` (quick links).
- **Contact:** `/contacto` (media contact section).

---

## Metadata changes

| Element | Before | After |
|--------|--------|--------|
| **Title** | "Fuente de Datos para Medios \| Bolivia Blue con Paz" | "Metodología y Fuente de Datos \| Dólar Blue Bolivia" (ES) / "Methodology & Data Source \| Bolivia Blue Dollar" (EN) |
| **Description** | Short line about real-time data for media. | Explains how the rate is calculated (source, median, 15 min), difference from official rate, and audience (media, researchers, developers). |
| **Keywords** | Generic (datos, fuente, API). | Methodology-focused: "metodología dólar blue", "cómo se calcula", "Binance P2P", etc. (ES/EN). |
| **Canonical** | `/fuente-de-datos` | Unchanged. |

---

## Schema changes

| Schema | Change |
|--------|--------|
| **Organization** | Kept. Description updated to mention "Metodología transparente: Binance P2P, mediana, actualización cada 15 min." Uses `BASE_URL` from seoSchema. |
| **WebPage** | **Added.** Name, description, url `/fuente-de-datos`, inLanguage. Aligns with methodology/trust intent. |
| **BreadcrumbList** | **Added.** Home → "Metodología y Fuente de Datos" (or EN equivalent). |
| **FAQPage** | **Added.** Four Question/Answer pairs matching the visible FAQ section (source, frequency, blue vs official, use in articles). |

Structured data is passed to `PageMeta` as `[organizationSchema, webPageSchema, breadcrumbSchema, faqSchema]`. No unsupported or promotional schema types were added.

---

## SEO and authority benefits

1. **Intent alignment:** Title, description, and H1 target "methodology" and "data source" so the page can rank for queries like "cómo se calcula dólar blue", "fuente datos dólar blue bolivia", "metodología tipo cambio bolivia".
2. **E-E-A-T:** Clear explanation of source, calculation, and limitations supports experience, expertise, authoritativeness, and trustworthiness.
3. **Citation value:** Recommended attribution and "how to cite" section make it easy for media and researchers to link and cite correctly.
4. **Internal linking:** Links to historical data, API, comparison, and monthly reports distribute authority and improve crawlability of key pages.
5. **FAQ rich results:** FAQPage schema can enable FAQ rich results in SERPs for the four questions.
6. **Single canonical page:** One strengthened page at `/fuente-de-datos` avoids duplication and keeps backlinks and signals focused.

---

## Follow-up recommendations

1. **Reportes index:** Add a `/reportes-mensuales` (or similar) index page and link it from this page and quick links so "monthly reports" does not point only to an example month.
2. **Last updated:** Optionally show a "Page last updated" or "Methodology verified on [date]" in the footer of the methodology section to reinforce freshness.
3. **Multilingual URL:** If the site later adds locale-based URLs (e.g. `/en/fuente-de-datos`), keep this page as the primary methodology URL and use hreflang for the English version.
4. **Structured data:** If you add a dedicated "Methodology" or "Dataset" type in the future, consider referencing this page as the `mainEntity` or documentation URL where appropriate.
