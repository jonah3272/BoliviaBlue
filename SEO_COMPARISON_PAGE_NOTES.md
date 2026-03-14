# Comparison Page Improvement – Implementation Notes

This document describes the improvements made to the comparison page at `/comparacion` so it becomes a strong SEO and authority asset for queries around blue dollar vs official rate in Bolivia.

---

## Route used

**`/comparacion`** – The existing Comparison page was strengthened. No new route or duplicate page. The same component (`Comparison.jsx`) and path are used. The page now serves two intents: (1) **dólar blue vs oficial Bolivia** (primary for SEO) and (2) **boliviablue.com vs bolivianblue.net** (existing competitor comparison).

---

## Sections added or improved

| Section | Change |
|--------|--------|
| **H1 and intro** | Updated from "boliviablue.com vs bolivianblue.net" to "Dólar blue vs tipo de cambio oficial" / "Blue dollar vs official exchange rate". Intro explains comparison between blue (parallel market) and official (BCB) and current difference in BOB and %. |
| **Cotización actual: blue vs oficial** | **New.** Four metric cards using real data from `currentRate`: (1) Blue dollar buy/sell (Binance P2P), (2) Official rate buy/sell (BCB), (3) Difference in BOB (blue mid − official mid), (4) Difference in % over official. Short labels explain each. Optional line: "Promedio última semana" from 1W history with link to historical data. |
| **Qué se compara y por qué importa** | **New.** Short explanation: official = BCB/banks, blue = parallel P2P; do not confuse them; many operations use blue as reference. Links to methodology and "what is blue dollar". |
| **BlueRateCards** | Unchanged. Still present with toggle for blue vs official view. |
| **FAQ: blue vs official** | **New.** Three Q&As: What is the official rate? What is the blue dollar? Why is there a difference? Visible on page and used for FAQPage schema. |
| **Enlaces relacionados** | **New.** Links to: home, dolar-blue-hoy, datos-historicos, fuente-de-datos, que-es-dolar-blue. |
| **boliviablue.com vs bolivianblue.net** | **Improved.** Table section retitled explicitly; "Last updated" replaced with rate timestamp when available. Rest of competitor comparison (table, Why Choose Us, speed test, testimonials) unchanged. |
| **Footer timestamp** | Now shows quote time from `currentRate.updated_at_iso` when available instead of generic "now". |

---

## Files changed

| File | Change |
|------|--------|
| `frontend/src/pages/Comparison.jsx` | Imports: added `fetchBlueHistory`, `getWebPage`, `getBreadcrumbList`, `getFAQPage`. State: added `avgSpread`. Effect: fetch 1W history and compute average spread (BOB and %). Derived: `hasOfficial`, `blueMid`, `officialMid`, `spreadBob`, `spreadPct`. FAQ array and schema (WebPage, BreadcrumbList, FAQPage). New sections: blue vs official metrics, explanation block, FAQ, related links. PageMeta: title/description/keywords aligned with blue vs official intent; structuredData = [webPageSchema, breadcrumbSchema, faqSchema]. Breadcrumb URL set to `/comparacion`. |
| `SEO_COMPARISON_PAGE_NOTES.md` | This file (new). |

No backend or routing changes. No changes to rate calculation, Supabase, or analytics.

---

## Metrics shown

All use existing data from `fetchBlueRate()` and, for average spread, `fetchBlueHistory('1W')`:

| Metric | Source | Shown when |
|--------|--------|------------|
| Blue buy/sell | `currentRate.buy`, `currentRate.sell` | `currentRate` loaded |
| Official buy/sell | `currentRate.official_buy`, `currentRate.official_sell` | `hasOfficial` (official_* present) |
| Difference (BOB) | `blueMid - officialMid` (mid = average of buy/sell when `mid` missing) | Both mids available |
| Difference (%) | `(spreadBob / officialMid) * 100` | `officialMid > 0` |
| Average spread (7 days) | From `fetchBlueHistory('1W')`: average of (blue mid − official mid) in BOB and in % | History returns points with official_* |

---

## Internal links added

- **/** – Cotización actual (current rate)
- **/dolar-blue-hoy** – Dólar blue hoy
- **/datos-historicos** – Datos históricos (in average-spread line and in related links)
- **/fuente-de-datos** – Metodología y fuente (in explanation block and related links)
- **/que-es-dolar-blue** – ¿Qué es el dólar blue? (in explanation block and related links)

Existing links on the page (e.g. to `/`, `/calculadora`, `/contacto`) were left as is.

---

## Metadata changes

| Element | Before | After |
|--------|--------|--------|
| **Title** | "boliviablue.com vs bolivianblue.net - Comparación Completa \| Bolivia Blue con Paz" | "Dólar blue vs oficial Bolivia \| Diferencia y comparación" (ES) / "Blue dollar vs official Bolivia \| Difference and comparison" (EN) |
| **Description** | Focus on boliviablue vs bolivianblue. | Focus on blue vs official: difference in BOB and %, what each rate is, why they differ, not to confuse them. |
| **Keywords** | boliviablue vs bolivianblue, mejor sitio, etc. | "dólar blue vs oficial Bolivia", "diferencia dólar blue y oficial", "tipo cambio paralelo vs oficial Bolivia", "blue dollar vs official". |
| **Canonical** | `/comparacion` | Unchanged. |

---

## Schema changes

| Schema | Before | After |
|--------|--------|--------|
| **ComparisonPage** | Single custom ComparisonPage (boliviablue vs bolivianblue). | Removed (not a standard type; page now centers on blue vs official). |
| **WebPage** | None. | **Added.** name, description, url `/comparacion`, inLanguage. |
| **BreadcrumbList** | None. | **Added.** Home → Comparación; item URL set to `/comparacion`. |
| **FAQPage** | None. | **Added.** Three Question/Answer pairs matching the visible FAQ (official rate, blue dollar, why difference). |

Structured data passed to PageMeta: `[webPageSchema, breadcrumbSchema, faqSchema]`.

---

## SEO and authority benefits

1. **Intent alignment:** Title, description, H1, and first sections target "dólar blue vs oficial", "diferencia dólar blue y oficial", "tipo cambio paralelo vs oficial Bolivia", "Bolivia blue dollar vs official rate".
2. **Real data:** Current blue, official, spread in BOB and % use the same rate source as the rest of the site; 7-day average spread reuses existing history API.
3. **Clarity and trust:** Short explanation of what each rate is and why they differ reduces confusion and supports E-E-A-T.
4. **Internal linking:** Links to homepage, dolar-blue-hoy, datos-historicos, fuente-de-datos, que-es-dolar-blue improve crawlability and topical association.
5. **FAQ rich results:** FAQPage schema can enable FAQ rich results in SERPs for the three questions.
6. **Single canonical page:** One improved page at `/comparacion` serves both blue-vs-official and platform-comparison intents without duplicate content.

---

## Follow-up recommendations

1. **Historical spread chart:** If desired, add a small chart of "spread over time" (e.g. last 30 days) reusing existing history and chart components, without new backend logic.
2. **Breadcrumb on site:** Ensure the main site navigation or breadcrumb component uses "Comparación" with href `/comparacion` so the URL is consistent everywhere.
3. **Inbound links:** Link to `/comparacion` from methodology and data source pages (e.g. "Compare blue and official rate") where relevant.
4. **Monitoring:** Track impressions/clicks for comparison-related queries in Search Console to refine title/description if needed.
