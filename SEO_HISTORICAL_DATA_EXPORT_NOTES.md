# Historical Data Export Feature – Implementation Notes

This document describes the public historical data download system added for Bolivia Blue (boliviablue.com). The feature is additive, server-backed, and designed to support SEO, data authority, and future Dataset schema distribution URLs.

---

## Endpoints Added

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/historical-data.csv` | Returns historical blue dollar rates as CSV (UTF-8, BOM). |
| GET | `/api/historical-data.json` | Returns historical blue dollar rates as JSON with metadata and attribution. |

Both endpoints use the same backend data-fetch logic and share the same query parameter behavior.

---

## Query Parameters Supported

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | No | Time range: `30d`, `90d`, `1y`, or `all`. **Default:** `30d`. |
| `limit` | number | No | Maximum number of rows to return. **Cap:** 50,000. Ignored if below 1 or above cap. |

Examples:
- `?range=30d` – last 30 days (default)
- `?range=90d` – last 90 days
- `?range=1y` – last 365 days
- `?range=all` – full history (capped by `limit`)
- `?range=all&limit=10000` – full history, max 10,000 rows

---

## Default Range and Limits

- **Default range:** `30d` if `range` is omitted or invalid.
- **Max rows:** 50,000 per request (`EXPORT_MAX_ROWS` in backend). For `range=all`, the most recent 50,000 rows are returned when the table has more than that.
- **Sort order:** Ascending by timestamp (oldest first). Documented for reproducibility.

---

## Fields Returned

All fields come from the existing `rates` table and current historical logic (no new calculation logic).

**CSV columns (stable order):**
- `timestamp` – ISO 8601 (e.g. `2025-03-14T18:40:00.000Z`)
- `buy` – blue market buy (BOB per USD)
- `sell` – blue market sell (BOB per USD)
- `mid` – blue market mid
- `official_buy` – Central Bank official buy
- `official_sell` – Central Bank official sell
- `official_mid` – Central Bank official mid

**JSON `data` array:** Each element has the same fields with keys: `timestamp`, `buy`, `sell`, `mid`, `official_buy`, `official_sell`, `official_mid`.  
BRL/EUR are not included; the export is USD/BOB–focused and matches the existing public rate/chart usage.

---

## Cache Behavior

- **Cache-Control:** `public, max-age=300` (5 minutes) for both CSV and JSON.
- Responses are cacheable by browsers and CDNs; 5 minutes keeps data reasonably fresh without overloading the database.
- **Content-Type:**  
  - CSV: `text/csv; charset=utf-8`  
  - JSON: `application/json; charset=utf-8`
- **CORS:** `Access-Control-Allow-Origin: *` so the endpoints can be used from other origins (e.g. scripts, other sites) without blocking.

---

## Files Changed

| File | Change |
|------|--------|
| `backend/server.js` | Added `getHistoricalExportRows()`, `GET /api/historical-data.csv`, `GET /api/historical-data.json`. Reuses `getRatesInRange` and `getAllRates` from `db-supabase.js`. |
| `frontend/src/pages/DatosHistoricos.jsx` | Imported `BASE_URL`. Extended Dataset schema with `distribution` (DataDownload for CSV and JSON). Added “Download from server (stable URLs)” section with links for CSV/JSON and ranges 30d, 90d, 1y, all; attribution line; kept existing client-side CSV button. |
| `frontend/src/pages/ApiDocs.jsx` | Documented `/api/historical-data.csv` and `/api/historical-data.json` (parameters, response, example URLs). |
| `SEO_HISTORICAL_DATA_EXPORT_NOTES.md` | This file. |

No changes were made to:
- Exchange rate calculation or scheduler
- Supabase fetch logic for charts, alerts, or analytics
- Routing or existing pages other than the above
- Raw Supabase exposure (all access remains server-backed)

---

## SEO and Authority Benefits

1. **Stable, citable URLs** – Researchers, journalists, and tools can link to or cite e.g. `https://boliviablue.com/api/historical-data.csv?range=30d` or `?range=all`.
2. **Dataset schema** – `/datos-historicos` Dataset JSON-LD now includes `distribution` with `contentUrl` pointing to the CSV and JSON export URLs, aligning with the visible “download” content.
3. **Trust and transparency** – Public, bounded exports with clear attribution (“Bolivia Blue con Paz”, boliviablue.com) support E-E-A-T and data-provider positioning.
4. **Linkability** – Stable download URLs are easy to reference in articles, papers, and developer docs.
5. **Future-proof** – Same URLs can be used in future schema or documentation (e.g. more granular `temporalCoverage` or additional distribution formats) without breaking existing links.

---

## Follow-Up Improvements (Recommended)

1. **Optional `format` query** – A single endpoint (e.g. `/api/historical-data`) could accept `format=csv` or `format=json` and return the appropriate type, reducing duplicate documentation while keeping the current paths for backward compatibility.
2. **Sitemap or index page** – If you add a data catalog or “open data” index, list these URLs there for crawlers and users.
3. **Rate limiting** – The existing API rate limiter applies to these routes; if exports become very popular, consider a separate (e.g. more permissive) limit for read-only export endpoints.
4. **Monitoring** – Log export usage (e.g. range and format) to prioritize caching or indexing (e.g. pre-generate 30d CSV/JSON periodically) if needed.
