# SEO Phase 1 – Changelog

**Date:** 2025-03-14  
**Scope:** Zero-risk metadata and indexing fixes for boliviablue.com.  
**Constraints respected:** No route deletions, no design changes, no business logic or Supabase fetch changes.

---

## 1. Files changed

| File | Changes |
|------|--------|
| `frontend/src/pages/DolarParaleloBoliviaEnVivo.jsx` | Removed noindex; added real rate timestamp; improved title/description with language variants; fixed import to `useAdsenseReadyWhen` (was `useAdsenseReady`) |
| `frontend/src/pages/DolarBlueHoy.jsx` | Removed noindex; use real rate timestamp for “last updated”; shortened title/description |
| `frontend/src/pages/CuantoEstaDolarBolivia.jsx` | Removed noindex; use real rate timestamp; shortened title/description |
| `frontend/src/pages/BolivianBlue.jsx` | Removed noindex; use real rate timestamp; shortened title/description |
| `frontend/src/pages/Home.jsx` | Added visible “last updated” line above rate cards; shortened title/description; import `formatDateTime` |
| `frontend/src/pages/QueEsDolarBlue.jsx` | Shortened title only (descriptions already distinct) |
| `frontend/src/pages/DatosHistoricos.jsx` | Shortened title and description |
| `frontend/src/utils/formatters.js` | `formatDateTime(isoString, locale?)` – optional locale, default `'es-BO'` |

---

## 2. What was changed

### 2.1 Indexing (noindex removed)

- **DolarParaleloBoliviaEnVivo:** Removed `noindex={true}`. Page is meant to rank for “dolar paralelo bolivia en vivo”; no strong reason to keep noindex (comment referred to “templated/query-based content” but the URL is a fixed landing page).
- **DolarBlueHoy:** Removed `noindex={true}`.
- **CuantoEstaDolarBolivia:** Removed `noindex={true}`.
- **BolivianBlue:** Removed `noindex={true}`.

All four pages are now indexable and already listed in the sitemap.

### 2.2 Canonical tags

- **Audit result:** All seven routes already self-canonicalize correctly via `PageMeta`:
  - `/` → canonical `/`
  - `/dolar-blue-hoy` → `/dolar-blue-hoy`
  - `/dolar-paralelo-bolivia-en-vivo` → `/dolar-paralelo-bolivia-en-vivo`
  - `/bolivian-blue` → `/bolivian-blue`
  - `/cuanto-esta-dolar-bolivia` → `/cuanto-esta-dolar-bolivia`
  - `/que-es-dolar-blue` → `/que-es-dolar-blue`
  - `/datos-historicos` → `/datos-historicos`
- No code change; canonicals are consistent and support bilingual targeting (hreflang handled in `PageMeta`).

### 2.3 Title tags and meta descriptions

- **Home:** Shorter titles (ES/EN); descriptions more specific (Binance P2P, sin registro).
- **DolarBlueHoy:** Shorter titles; descriptions focused on “hoy” and parallel market.
- **DolarParaleloBoliviaEnVivo:** Title/description now language-dependent (ES/EN); “EN VIVO” / “LIVE” focus; distinct from “dólar blue hoy”.
- **BolivianBlue:** Shorter titles; descriptions focused on Bolivian Blue and 15 min updates.
- **CuantoEstaDolarBolivia:** Shorter question-style titles; descriptions focused on “cuánto está” and calculator.
- **QueEsDolarBlue:** Slightly shorter titles; descriptions unchanged (already educational and distinct).
- **DatosHistoricos:** Shorter titles and descriptions; “archivo” / “archive” and download kept.

Titles kept within common best-practice length (~50–60 chars where possible); descriptions kept specific and under ~155 chars.

### 2.4 Last updated timestamp (real rate data)

- **formatters.js:** `formatDateTime(isoString, locale?)` now accepts an optional `locale` (default `'es-BO'`). Existing call sites unchanged.
- **Home:** A visible line above `BlueRateCards`: “Datos actualizados / Data updated: {formatDateTime(currentRate.updated_at_iso)}” when `currentRate` is loaded. Uses the rate’s `updated_at_iso` from the API (no faked time).
- **DolarBlueHoy, DolarParaleloBoliviaEnVivo, CuantoEstaDolarBolivia, BolivianBlue:** The existing “Última actualización / Last updated” line now shows the **rate timestamp** (`currentRate?.updated_at_iso`) when available, formatted with `formatDateTime(..., language === 'es' ? 'es-BO' : 'en-US')`. Fallback remains the previous client-side refresh time until the first rate load.

All timestamps use America/La_Paz and are localized (ES/EN).

---

## 3. Why it improves SEO

- **Indexing:** High-intent rate pages (en vivo, hoy, cuánto está, bolivian blue) can now be indexed and compete for their queries instead of being noindexed.
- **Canonicals:** Confirmed self-canonical and consistent; reduces risk of duplicate-content and cannibalization across the audited routes.
- **Titles/descriptions:** More distinct per page and per intent (hoy vs en vivo vs question vs educational vs historical), which can improve CTR and reduce keyword cannibalization. Shorter titles are less likely to be truncated in SERPs.
- **Last updated:** A visible, crawlable “last updated” based on real rate data supports freshness signals and user trust without inventing dates.

---

## 4. Risks and follow-up

### Risks

- **Low:** Removing noindex may temporarily change how Google treats these URLs (from “don’t index” to “index”). Re-crawl and indexing are expected; no redirect or URL change.
- **Low:** `formatDateTime` now has an optional second parameter; all existing uses pass one argument and keep default `'es-BO'` behavior.

### Follow-up (optional)

- **index.html:** The static fallback in `frontend/index.html` still has the previous homepage title and meta description. For crawlers that do not run JS, you can update them to align with the new Home titles/descriptions.
- **PageMeta og:url:** Confirm in production that `og:url` is output as the full canonical URL (e.g. `content` attribute); Helmet sometimes uses `href` for `og:url`, which is invalid in HTML5 (should be `content`). If needed, fix in `PageMeta.jsx` in a later pass.
- **Monitor:** After deployment, check Search Console for indexing of `/dolar-paralelo-bolivia-en-vivo`, `/dolar-blue-hoy`, `/cuanto-esta-dolar-bolivia`, and `/bolivian-blue` over the next 1–2 weeks.

---

## 5. Summary

Phase 1 is limited to: (1) removing noindex on four rate pages, (2) confirming canonicals, (3) making titles and meta descriptions more distinct and concise, and (4) showing a real, localized “last updated” on the homepage and four rate pages. No routes were removed, no UI or business logic was changed, and Supabase data fetching is unchanged.
