# SEO Phase 4 – Crawlable Initial HTML & Pre-rendering Notes

**Date:** 2025-03-14  
**Scope:** Crawlable initial HTML for key SEO routes; single source for BreadcrumbList; dateModified and Dataset.distribution cleanup. No framework migration; no UI or business-logic changes.

---

## 1. Approach chosen

**Build-time static shell injection** via a post-build Node script (`scripts/inject-seo-shell.cjs`).

- After `vite build`, the script reads `dist/index.html`, then:
  - **Home (/):** Replaces `<div id="root"></div>` with a static shell (H1, intro paragraph, nav links) and ensures title/meta/canonical match homepage intent. Writes result back to `dist/index.html`.
  - **Other key routes:** For each of `/dolar-blue-hoy`, `/bolivian-blue`, `/que-es-dolar-blue`, `/datos-historicos`, builds a route-specific HTML from the same base: route-specific title, description, canonical, og/twitter meta, and a static shell (H1, intro, nav). Writes to `dist/<path>/index.html`.
- **Vercel rewrites** (in `vercel.json`) send requests for these paths to the corresponding `index.html` (e.g. `/dolar-blue-hoy` → `/dolar-blue-hoy/index.html`), so crawlers and first paint get the correct document and body without waiting for client-side routing.
- The same React app and JS bundles load for all URLs; React mounts into `#root` and replaces the static shell on hydrate. No headless browser, no SSR runtime, no new framework.

---

## 2. Why this approach

- **Safest for this repo:** No new dependencies (e.g. react-snap, vite-plugin-ssr). No change to Vite config or React Router. Only a small CJS script and rewrites.
- **Aligns with “lightest-weight”:** String-based replacement on the built HTML; no execution of the app at build time.
- **Controlled scope:** Only SEO-critical shell (title, meta, canonical, H1, one paragraph, a few links). Charts, live rate, and widgets remain client-rendered to avoid coupling to build-time data or added risk.
- **Compatible with current hosting:** Vercel already serves `frontend/dist`; adding rewrites and extra static files is standard.

Alternatives considered and not used:

- **vite-plugin-ssr / Vike:** Would require route-based entry and structural changes.
- **react-snap / Puppeteer:** Adds a heavy dependency and build-time browser; higher maintenance and flakiness.
- **Full SSR (e.g. Remix, Next):** Out of scope per “do not migrate frameworks.”

---

## 3. Routes affected

| Route | Pre-rendered shell | Served as |
|-------|--------------------|-----------|
| `/` | Yes (H1, intro, 4 links) | `dist/index.html` |
| `/dolar-blue-hoy` | Yes (H1, intro, 4 links) | `dist/dolar-blue-hoy/index.html` |
| `/bolivian-blue` | Yes (H1, intro, 4 links) | `dist/bolivian-blue/index.html` |
| `/que-es-dolar-blue` | Yes (H1, intro, 4 links) | `dist/que-es-dolar-blue/index.html` |
| `/datos-historicos` | Yes (H1, intro, 4 links) | `dist/datos-historicos/index.html` |

**Intentionally not pre-rendered (client-only):**

- `/dolar-paralelo-bolivia-en-vivo` – Same tier as other rate pages; can be added later by extending the script and rewrites.
- `/cuanto-esta-dolar-bolivia` – Same; omitted to keep Phase 4 to a small set; expansion path is documented below.
- All other routes (calculadora, noticias, blog, etc.) – No static shell; they still receive the catch-all `index.html` and work as before.

---

## 4. Files changed

| File | Change |
|------|--------|
| `frontend/scripts/inject-seo-shell.cjs` | **New.** Post-build script: injects route-specific meta and body shell for 5 routes; writes `dist/index.html` and `dist/<path>/index.html` for the four sub-routes. |
| `frontend/package.json` | `build` script: added `&& node scripts/inject-seo-shell.cjs` after `vite build`. |
| `vercel.json` | Added rewrites for `/dolar-blue-hoy`, `/bolivian-blue`, `/que-es-dolar-blue`, `/datos-historicos` → corresponding `/path/index.html` before the catch-all. |
| `frontend/src/components/Breadcrumbs.jsx` | Removed BreadcrumbList JSON-LD and the inline script; removed unused base-URL helpers. BreadcrumbList is now only emitted via PageMeta (single source of truth). |
| `frontend/src/utils/seoSchema.js` | `getDataFeedItem`: only adds `dateModified` when a timestamp is provided; no fallback to current time. |
| `frontend/src/pages/Home.jsx` | DataFeed/WebPage: use `currentRate?.updated_at_iso ?? null`; omit `dateModified` when no rate timestamp. |
| `frontend/src/pages/DolarBlueHoy.jsx` | Article/WebPage: `dateModified` only when `currentRate?.updated_at_iso` exists (no `new Date()` fallback). |
| `frontend/src/pages/DolarParaleloBoliviaEnVivo.jsx` | WebPage: `dateModified` only when rate timestamp available. |
| `frontend/src/pages/CuantoEstaDolarBolivia.jsx` | Article/WebPage: same `dateModified` rule. |
| `frontend/src/pages/BolivianBlue.jsx` | Article/WebPage: same `dateModified` rule. |
| `frontend/src/pages/DatosHistoricos.jsx` | Dataset: removed `distribution` (no `/api/historical-data.csv` endpoint). |

---

## 5. Known limitations

- **Shell content is Spanish-only.** The injected H1/intro/links are fixed in Spanish. Language switching remains client-side (React). For a future improvement, the script could accept or detect a locale and inject different copy.
- **No structured data in the static HTML.** JSON-LD (Organization, WebPage, FAQ, Dataset, etc.) is still injected by React/Helmet. Crawlers that execute JS will see it; those that don’t only see the static shell and the existing WebApplication block in the source `index.html` (homepage).
- **Trailing slash:** Vercel may serve `/dolar-blue-hoy/` from the same file depending on config. Links in the shell use no trailing slash.
- **Expansion:** Adding more routes (e.g. `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia`) requires adding an entry to `ROUTES` in `inject-seo-shell.cjs` and a matching rewrite in `vercel.json`.

---

## 6. Rollback

- **Disable shell injection:** In `frontend/package.json`, set `"build": "vite build"` (remove `&& node scripts/inject-seo-shell.cjs`). Deploy. All routes will again be served the default `dist/index.html` (SPA fallback).
- **Revert Vercel rewrites:** Remove the four route-specific rewrites from `vercel.json` so only the catch-all remains. Pre-rendered HTML files will still exist in `dist` but won’t be served for those paths.
- **BreadcrumbList:** To restore dual output (Breadcrumbs + PageMeta), re-add the JSON-LD script in `Breadcrumbs.jsx` and the base-URL helpers (optional; duplicate BreadcrumbList is valid but redundant).
- **dateModified / Dataset:** Revert the edits in the listed pages and `seoSchema.js` if you need the previous behavior (e.g. fallback date or distribution URL).

---

## 7. Routes left client-rendered (and why)

- **`/dolar-paralelo-bolivia-en-vivo`** – Same intent family as `/dolar-blue-hoy`; left out to limit Phase 4 scope. Add via the same script + rewrite pattern if desired.
- **`/cuanto-esta-dolar-bolivia`** – Same; can be added later.
- **Calculadora, Noticias, Blog, About, Contact, etc.** – Lower priority for crawlable shell; no static HTML generated. They continue to work with the SPA and catch-all `index.html`.

---

## 8. index.html and static fallback

- **Source `frontend/index.html`** is unchanged. It still contains the homepage-oriented title, description, and canonical. It is used as the Vite entry and the template for the single build output; the inject script then operates on the **built** `dist/index.html`.
- **Conflict resolution:** For `/`, the built `dist/index.html` keeps that same homepage meta and adds the home shell. For the four sub-routes, requests are rewritten to `dist/<path>/index.html`, which has route-specific meta and shell, so the static fallback no longer implies “homepage” for those URLs. There is no conflict: each key route has its own document and intent.

---

## 9. BreadcrumbList and dateModified summary

- **BreadcrumbList:** One source of truth. Emitted only via PageMeta (per-page `breadcrumbSchema`). The Breadcrumbs component no longer outputs JSON-LD, avoiding duplication.
- **dateModified:** On live-rate and home pages, `dateModified` is set only when `currentRate?.updated_at_iso` (or equivalent) is available. No “current time” fallback, to avoid misleading freshness.
- **Dataset.distribution:** Removed from `/datos-historicos` because `/api/historical-data.csv` does not exist. Can be re-added when a real download URL is available.
