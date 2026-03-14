# SEO Phase 3 – Schema and Data Authority Notes

**Date:** 2025-03-14  
**Scope:** Structured data improvements, data authority, crawlability. No framework/UI/business-logic changes; additive only.

---

## 1. Files changed

| File | Changes |
|------|--------|
| `frontend/src/utils/seoSchema.js` | **New.** Reusable helpers: `getWebPage`, `getBreadcrumbList`, `getFAQPage`, `getDataset`, `getDataFeedItem`; `BASE_URL`, `PUBLISHER_ORG`. |
| `frontend/src/pages/Home.jsx` | Removed AggregateRating, VideoObject, LocalBusiness; added WebPage (dateModified from rate), DataFeed uses rate timestamp; BreadcrumbList via helper. |
| `frontend/src/pages/DolarBlueHoy.jsx` | Added WebPage, BreadcrumbList; Article dateModified from `currentRate?.updated_at_iso`. |
| `frontend/src/pages/DolarParaleloBoliviaEnVivo.jsx` | Replaced single WebPage object with helper-based WebPage + BreadcrumbList; added dateModified, inLanguage. |
| `frontend/src/pages/CuantoEstaDolarBolivia.jsx` | Added WebPage, BreadcrumbList; Article dateModified from rate. |
| `frontend/src/pages/BolivianBlue.jsx` | Added WebPage, BreadcrumbList; Article dateModified from rate. |
| `frontend/src/pages/QueEsDolarBlue.jsx` | Removed Article.aggregateRating; added WebPage, BreadcrumbList. |
| `frontend/src/pages/DatosHistoricos.jsx` | Strengthened Dataset (variableMeasured, temporalCoverage, updateFrequency, creator/publisher); added WebPage, BreadcrumbList; added crawlable support sentence (chart/table + update cadence). |

---

## 2. Schema types added, changed, or removed

### Home (`/`)
- **Removed:** `AggregateRating` (inside WebApplication) – no visible reviews on site; risk of rich-result policy issues.
- **Removed:** `VideoObject` – no real video; would be misleading.
- **Removed:** `LocalBusiness` / `FinancialService` – weak fit for a data/rate site; not used for local pack.
- **Added:** `WebPage` – name, description, url `/`, dateModified (from `currentRate?.updated_at_iso`), inLanguage, mainEntity (FinancialProduct when rate exists).
- **Changed:** `DataFeed.dataFeedElement[].dateModified` – now uses `currentRate?.updated_at_iso` (or fallback) instead of `new Date().toISOString()`.
- **Changed:** `BreadcrumbList` – built via `getBreadcrumbList` for consistency.
- **Kept:** Organization, FAQPage, FinancialProduct (when rate loaded), DataFeed, BreadcrumbList.

### DolarBlueHoy (`/dolar-blue-hoy`)
- **Added:** `WebPage` – dateModified from rate, inLanguage, canonical url.
- **Added:** `BreadcrumbList` – Inicio → Dólar Blue Hoy.
- **Changed:** `Article.dateModified` – uses `currentRate?.updated_at_iso` when available.
- **Kept:** Article, FAQPage.

### DolarParaleloBoliviaEnVivo (`/dolar-paralelo-bolivia-en-vivo`)
- **Replaced:** Single inline WebPage with helper-based `WebPage` (dateModified from rate, inLanguage, mainEntity FinancialProduct).
- **Added:** `BreadcrumbList` – Inicio → Dólar Paralelo Bolivia EN VIVO.
- **Kept:** No FAQ on page, so no FAQPage.

### CuantoEstaDolarBolivia (`/cuanto-esta-dolar-bolivia`)
- **Added:** `WebPage`, `BreadcrumbList`; Article dateModified from rate.
- **Kept:** Article, FAQPage.

### BolivianBlue (`/bolivian-blue`)
- **Added:** `WebPage`, `BreadcrumbList`; Article dateModified from rate.
- **Kept:** Article, FAQPage.

### QueEsDolarBlue (`/que-es-dolar-blue`)
- **Removed:** `Article.aggregateRating` – no visible reviews; avoids policy/trust issues.
- **Added:** `WebPage`, `BreadcrumbList`.
- **Kept:** Article, FAQPage.

### DatosHistoricos (`/datos-historicos`)
- **Strengthened:** `Dataset` – added variableMeasured (USD/BOB blue rate), temporalCoverage (`2024-01-01/..`), updateFrequency (text: live source every 15 min), creator/publisher; description expanded to mention update cadence.
- **Added:** `WebPage` – name, description, dateModified, inLanguage.
- **Added:** `BreadcrumbList` – Inicio → Datos Históricos.
- **Kept:** Dataset as primary data-authority schema.

---

## 3. Page-by-page reasoning

- **Home:** Main hub; schema should reflect “authority + fresh rate” without unsupported rich results (ratings, video). WebPage + DataFeed with real dateModified reinforces freshness; removing rating/video/local reduces risk.
- **DolarBlueHoy / CuantoEstaDolarBolivia / BolivianBlue:** Live-rate pages; WebPage + BreadcrumbList + dateModified from API (`updated_at_iso`) align structured data with visible “last updated” and improve freshness signals.
- **DolarParaleloBoliviaEnVivo:** Same intent; single WebPage replaced with helper pattern and BreadcrumbList for consistency and inLanguage/dateModified.
- **QueEsDolarBlue:** Educational; Article + FAQ are appropriate. Dropping aggregateRating keeps schema aligned with visible content.
- **DatosHistoricos:** Data-authority page; Dataset with variableMeasured, temporalCoverage, updateFrequency, and clear publisher/creator strengthens dataset discovery and trust. WebPage + BreadcrumbList complete the set.

---

## 4. Validation and implementation notes

- **dateModified:** All live-rate pages and Home use `currentRate?.updated_at_iso` when available (from `fetchBlueRate`); otherwise fallback to `new Date().toISOString()` so schema always has a value.
- **BreadcrumbList:** Some pages also render the `Breadcrumbs` component, which outputs its own BreadcrumbList JSON-LD. Duplicate BreadcrumbList can occur; search engines typically dedupe. Optional follow-up: output BreadcrumbList only from PageMeta and remove from Breadcrumbs component.
- **Dataset.distribution.contentUrl:** Points to `https://boliviablue.com/api/historical-data.csv`. If that endpoint does not exist or returns something else, consider removing or updating distribution.
- **Dataset.temporalCoverage:** Used `2024-01-01/..` (start to open end). Valid for Schema.org.
- **inLanguage:** Consistently `es-BO` or `en-US` per page language.

---

## 5. Schema intentionally not implemented (and why)

- **AggregateRating (any page):** No visible review/rating UI; adding rating schema would be unsupported and policy-sensitive. Removed from Home and QueEsDolarBlue.
- **VideoObject:** No real video content; omitted to avoid misleading rich results.
- **LocalBusiness / FinancialService (Home):** Site is a data/tools hub, not a local business; skipped to keep schema focused.
- **DataFeed for /datos-historicos:** Dataset is the correct type for an archive; DataFeed is used for the live rate feed on Home only.
- **FAQPage on DolarParaleloBoliviaEnVivo:** Page has no FAQ section; no FAQPage added.
- **Same-as / social links in Organization:** sameAs left empty; can be filled when official profiles exist.

---

## 6. Reusable schema pattern

- **Location:** `frontend/src/utils/seoSchema.js`
- **Exports:** `BASE_URL`, `PUBLISHER_ORG`, `getWebPage`, `getBreadcrumbList`, `getFAQPage`, `getDataset`, `getDataFeedItem`.
- **Usage:** New or updated pages should use these helpers for WebPage, BreadcrumbList, Dataset, and DataFeed items so schema stays consistent and canonical URLs / publisher / inLanguage follow one convention.

---

## 7. Crawlable support content added

- **DatosHistoricos:** One short sentence under the intro: “El gráfico y la tabla muestran compra/venta y promedio por período. Los datos provienen de la misma fuente que la cotización en vivo (actualización cada 15 min).” / English equivalent. This backs the Dataset’s updateFrequency and description without turning the page into a long post.

No other data-heavy pages required extra support copy; they already had “last updated” and/or short chart/rate explanations.

---

## 8. Static fallback (index.html)

- **Not changed in Phase 3.** The static JSON-LD in `frontend/index.html` remains a single `WebApplication` block for crawlers before React. React overwrites meta and injects the full schema set for `/` after load. If desired in a later phase, the static block could be reduced to Organization only to avoid duplicate WebApplication-style claims.
