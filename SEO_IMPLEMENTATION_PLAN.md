# SEO Implementation Plan — Bolivia Blue (boliviablue.com)

**Status:** Plan only — no code changes until approved.  
**Scope:** Safe, incremental SEO improvements for an existing production React + Vite SPA that already ranks well.  
**Constraints:** No refactors of unrelated code, no UI redesign, no changes to exchange-rate business logic, no route removal, no breaking analytics/ads/alerts/charts/Supabase.

---

## 1. Primary SEO Issues Hurting Rankings

### 1.1 Client-side metadata and schema

- **Issue:** All `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph, Twitter cards, and JSON-LD are injected by React Helmet after JavaScript runs. Crawlers that do not execute JS (or run it with limits) may see only the static `index.html` shell.
- **Impact:** Risk of wrong or missing titles/descriptions in SERPs, weak or missing rich results from structured data, and inconsistent canonicals for deep-linked URLs.
- **Current mitigation:** Static meta exists in `index.html` for the homepage only; all other routes depend entirely on client-side Helmet.

### 1.2 Route cannibalization

- **Issue:** Multiple pages target very similar keywords (e.g. “dólar blue hoy”, “dólar paralelo en vivo”, “cuánto está el dólar”, “bolivian blue”, “blue dollar bolivia”). Titles and H1s are close; content structure is similar (rate cards + chart + text).
- **Impact:** Google may split signals across URLs or pick a single URL and demote others, reducing visibility for some high-intent queries.
- **Evidence:** `/dolar-blue-hoy`, `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia`, `/bolivian-blue` all serve “current rate + chart” with overlapping keyword sets.

### 1.3 Indexing issues

- **Issue:** `/dolar-paralelo-bolivia-en-vivo` has `noindex={true}` in `PageMeta`. This is a high-intent, sitemap-listed URL that is explicitly excluded from indexing.
- **Impact:** A valuable “en vivo” landing page does not compete in SERPs; users searching that phrase may not find the site.
- **Other:** Stage environment correctly uses noindex; production rate pages should not.

### 1.4 Sitemap limitations

- **Issue:** `frontend/public/sitemap.xml` is static. New blog posts or new routes require manual edits or a separate run of `generate-sitemap`; blog slugs are not driven by a single source of truth at build or deploy time.
- **Impact:** New content can be missing from the sitemap for long periods; lastmod may become stale; no automatic inclusion of dynamic routes (e.g. new blog articles from Supabase).

### 1.5 Weak dataset-level structured data

- **Issue:** No schema.org `Dataset` or robust `DataFeed` for the historical exchange-rate time series. Home has a custom “DataFeed” object with a single current rate; there is no machine-readable description of the full historical dataset, update frequency, or coverage.
- **Impact:** Missed opportunity for dataset-rich results and clearer signals to search engines about the site’s core data product (live + historical blue rate).

### 1.6 Internal linking opportunities

- **Issue:** Footer does not link to key rate pages (e.g. “Dólar hoy”, “Datos históricos”, “Calculadora” as rate-related). Some rate pages could more clearly point to the “main” rate URL and to calculator/datos-historicos. Blog and noticias could link to rate and calculator more consistently.
- **Impact:** Weaker topical clustering and pass of authority to the most important commercial and informational URLs.

### 1.7 Page speed and crawlability risks

- **Issue:** Full client-side rendering means crawlers must download and execute the full JS bundle before seeing content and links. Lazy-loaded routes (e.g. chart, news) delay critical content. No server-side or pre-rendered HTML for key landing pages.
- **Impact:** Slower “time to visible content” for bots; risk of incomplete crawling under budget or timeout; Core Web Vitals (LCP, INP) depend entirely on client hydration.

---

## 2. Route intent map

For each route: primary keyword, secondary keyword, search intent, index or not, canonical target, overlap with other pages.

| Route | Primary target keyword | Secondary target keyword | Search intent | Should index? | Canonical target | Overlaps |
|-------|------------------------|--------------------------|---------------|---------------|-----------------|----------|
| `/` | dólar blue Bolivia, bolivia blue rate | tipo de cambio Bolivia, cotización dólar | Informational + transactional (dashboard) | Yes | `https://boliviablue.com/` | Home is the main hub; overlaps in theme with all rate pages but is the main entry. |
| `/dolar-blue-hoy` | dólar blue hoy | cotización dólar blue hoy, precio dólar Bolivia hoy | Transactional / quick answer | Yes | `https://boliviablue.com/dolar-blue-hoy` | Overlaps with `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia` (same “current rate” intent). |
| `/dolar-paralelo-bolivia-en-vivo` | dolar paralelo bolivia en vivo | dólar blue en vivo, cotización en vivo | Transactional / real-time | Yes (remove noindex) | `https://boliviablue.com/dolar-paralelo-bolivia-en-vivo` | Overlaps with `/dolar-blue-hoy`, `/cuanto-esta-dolar-bolivia`. Differentiate by “en vivo” and real-time framing. |
| `/bolivian-blue` | bolivian blue, bolivia blue rate | bolivia blue exchange rate, tipo cambio blue Bolivia | Informational + transactional | Yes | `https://boliviablue.com/bolivian-blue` | Overlaps with `/blue-dollar-bolivia` (EN), `/dolar-blue-hoy`. Canonical Spanish “brand” rate page. |
| `/blue-dollar-bolivia` | blue dollar bolivia | bolivia blue dollar, dollar rate Bolivia | Informational + transactional (English) | Yes | `https://boliviablue.com/blue-dollar-bolivia` | Overlaps with `/bolivian-blue`; English counterpart. Keep both; differentiate by language/intent. |
| `/cuanto-esta-dolar-bolivia` | cuanto esta el dolar en Bolivia | precio dólar Bolivia, a cuanto esta el dolar | Transactional / quick answer | Yes | `https://boliviablue.com/cuanto-esta-dolar-bolivia` | Overlaps with `/dolar-blue-hoy`, `/dolar-paralelo-bolivia-en-vivo`. Question-based intent. |
| `/cotiza-dolar-paralelo` | cotiza dolar paralelo | cotización dólar paralelo, cotizar dólar Bolivia | Transactional | Yes | `https://boliviablue.com/cotiza-dolar-paralelo` | Some overlap with calculator and rate pages; focus on “cotizar” (quote) intent. |
| `/datos-historicos` | datos históricos dólar blue | histórico tipo cambio Bolivia, gráficos dólar blue | Informational | Yes | `https://boliviablue.com/datos-historicos` | Complements rate pages; distinct “historical data” intent. |
| `/calculadora` | calculadora dólar Bolivia | convertir dólar a boliviano, calculadora tipo cambio | Transactional | Yes | `https://boliviablue.com/calculadora` | Tool-only; links to rate pages; minimal overlap. |
| `/que-es-dolar-blue` | qué es el dólar blue | dólar blue explicación, dólar paralelo Bolivia | Informational | Yes | `https://boliviablue.com/que-es-dolar-blue` | Educational; distinct from rate/today pages. |
| `/binance-p2p-bolivia` | Binance P2P Bolivia | comprar dólares Binance Bolivia, USDT Bolivia P2P | Transactional + informational | Yes | `https://boliviablue.com/binance-p2p-bolivia` | Distinct platform intent; supports rate pages. |
| `/usdt-bolivia` | USDT Bolivia | USDT a BOB, stablecoin Bolivia | Transactional + informational | Yes | `https://boliviablue.com/usdt-bolivia` | Distinct from Binance P2P; related to rate. |
| `/dolar-blue-la-paz` | dólar blue La Paz | tipo cambio La Paz, cotización La Paz | Local transactional | Yes | `https://boliviablue.com/dolar-blue-la-paz` | Overlaps with national rate pages; differentiate by city. |
| `/dolar-blue-santa-cruz` | dólar blue Santa Cruz | tipo cambio Santa Cruz, cotización Santa Cruz | Local transactional | Yes | `https://boliviablue.com/dolar-blue-santa-cruz` | Same as La Paz for another city. |
| `/dolar-blue-cochabamba` | dólar blue Cochabamba | tipo cambio Cochabamba, cotización Cochabamba | Local transactional | Yes | `https://boliviablue.com/dolar-blue-cochabamba` | Same for Cochabamba. |

**Summary**

- **Index all** listed routes; remove noindex from `/dolar-paralelo-bolivia-en-vivo`.
- **Canonical:** Each URL is its own canonical; no consolidation that would remove pages. Use internal links and subtle on-page differentiation to clarify primary target per URL.
- **Overlap handling:** Differentiate by keyword (hoy / en vivo / cuánto está), language (bolivian-blue vs blue-dollar-bolivia), and city for city pages. Avoid identical titles and near-duplicate content.

---

## 3. Canonical strategy (Spanish and English) without deleting pages

### 3.1 Principles

- Keep all existing routes; no 410 or route removal.
- One canonical URL per page; no cross-canonicalizing different intents (e.g. do not canonicalize `/dolar-blue-hoy` to `/`).
- Language: Spanish as default (x-default); English via `?lang=en` or dedicated English URLs where they exist (e.g. `/blue-dollar-bolivia`).

### 3.2 Spanish

- **Default:** All Spanish pages use their own path as canonical (e.g. `https://boliviablue.com/dolar-blue-hoy`). No query in canonical (strip `?lang=en` if present).
- **Hreflang:** Each page’s `<link rel="alternate" hreflang="es" href="https://boliviablue.com/...">` (path only). x-default = Spanish version (same as `es` for Spanish-first pages).
- **Already in place:** PageMeta builds canonical and hreflang client-side; ensure all rate and key content pages pass the correct `canonical` prop (path only, no trailing slash except if consistent).

### 3.3 English

- **Option A (current):** Spanish URLs with `?lang=en`; canonical remains the Spanish URL (so one URL per “page”, two languages). Hreflang en points to `...?lang=en`.
- **Option B (where dedicated EN URLs exist):** e.g. `/blue-dollar-bolivia` as the English canonical for “blue dollar Bolivia”. Then:
  - `hreflang="en"` → `https://boliviablue.com/blue-dollar-bolivia`
  - `hreflang="es"` → `https://boliviablue.com/bolivian-blue`
  - x-default → Spanish (`/bolivian-blue`) for global default.
- **Recommendation:** Keep Option A for most pages (single URL, lang by query). For “bolivian blue” vs “blue dollar bolivia”, keep both `/bolivian-blue` and `/blue-dollar-bolivia` as separate canonicals with correct hreflang (es → bolivian-blue, en → blue-dollar-bolivia) and x-default to Spanish.

### 3.4 Duplicate / redirect routes

- Existing redirects (e.g. `/bolivia-blue-rate` → `/bolivian-blue`) stay. Redirected URLs have no canonical of their own; they are not indexed.
- No new redirects that would remove or merge the 15 routes in the intent map; only clarify canonicals and hreflang.

---

## 4. Safest implementation path for crawlable SEO in React + Vite

Goal: Improve crawlable SEO signals without replacing the SPA or breaking existing behavior. Options below are additive and can be combined in phases.

### 4.1 Pre-rendering selected SEO-critical routes (recommended)

- **What:** Use a pre-render step (e.g. `vite-plugin-prerender` or similar) at build time to generate static HTML for a small set of routes: `/`, `/dolar-blue-hoy`, `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia`, `/bolivian-blue`, `/que-es-dolar-blue`, `/calculadora`.
- **How:** Build produces `index.html` and e.g. `dolar-blue-hoy/index.html`, etc. Router and app still work as SPA; crawlers get full HTML on first request for those URLs.
- **Risks:** Pre-render must run after (or with) a way to get “current” rate for meta/structured data (e.g. build-time API or placeholder). No change to runtime logic.
- **Safety:** Additive; existing non-pre-rendered routes unchanged. Test that hydration still works and that meta is not duplicated (pre-rendered meta in HTML, Helmet may overwrite on client—acceptable).

### 4.2 Static HTML generation for key landing pages

- **What:** Manually or script-generated static HTML files for 1–3 top routes (e.g. `/`, `/dolar-blue-hoy`) with correct title, description, canonical, and one JSON-LD block. Placed in `frontend/dist` so they are served for those paths (may require server/rewrite rules to serve `dolar-blue-hoy.html` for `/dolar-blue-hoy`).
- **How:** Script that fetches latest rate (or uses placeholder), fills a template, writes to `dist`. Run in CI after build or as a post-build step.
- **Risks:** Must stay in sync with live data (e.g. rate) or use generic text; otherwise low risk.
- **Safety:** Additive; SPA can still load underneath if the server falls back to SPA for the same path.

### 4.3 Server-rendered meta fallback

- **What:** A small backend (or edge) service that for known paths returns minimal HTML with only `<title>`, `<meta name="description">`, `<link rel="canonical">`, and one JSON-LD. Optionally, the same service could return 200 + this HTML for crawler user-agents and 302 to the SPA for users.
- **How:** e.g. Vercel serverless/edge middleware or a small Node route that detects bot or `?_escaped_fragment_=` and responds with static or dynamically filled meta. Frontend remains unchanged.
- **Risks:** More moving parts; need to keep meta in sync between backend and frontend (e.g. shared copy or config). Bot detection has edge cases.
- **Safety:** Additive; default behavior remains “serve SPA”.

### 4.4 Structured data in initial HTML

- **What:** Ensure at least one JSON-LD block (e.g. WebApplication or Organization) is present in the initial HTML for all routes, not only injected by Helmet. Options:
  - **A.** Keep current Helmet injection and add pre-render (so pre-rendered HTML already contains JSON-LD).
  - **B.** For non-pre-rendered routes, add a small server/edge layer that injects a minimal JSON-LD (e.g. Organization) into `index.html` based on path (e.g. read from a map path → schema).
- **How:** Pre-render (4.1) covers pre-rendered routes. For others, a build step or server that modifies `index.html` per path is possible but more complex; Phase 2 can start with improving and validating existing Helmet JSON-LD.
- **Safety:** Additive; duplicate JSON-LD (same @type) can be deduplicated by search engines; avoid contradicting values.

### 4.5 Recommended order

1. **Immediate (Phase 1–2):** Fix noindex, canonicals, and sitemap; add Dataset/DataFeed schema where it fits; no new infrastructure.
2. **Next (Phase 3):** Introduce pre-rendering for 5–7 critical routes (option 4.1) so crawlers receive full HTML and meta for the most important URLs. This gives the biggest crawlability gain with minimal risk.
3. **Optional later:** Static HTML for 1–2 routes (4.2) or server-rendered meta fallback (4.3) if pre-rendering is insufficient or not adopted. Prefer pre-render first to avoid maintaining two systems.

---

## 5. Phased implementation order

### Phase 1: Zero-risk metadata and indexing fixes

**Goal:** Fix clear errors and indexing decisions without changing architecture or UI.

| # | Task | Details | Risk |
|---|------|---------|------|
| 1.1 | Remove noindex from `/dolar-paralelo-bolivia-en-vivo` | In `DolarParaleloBoliviaEnVivo.jsx`, set `noindex={false}` or remove the prop so PageMeta defaults to index. | Low |
| 1.2 | Audit canonical props | Ensure every page in the route intent map passes correct `canonical` (path only, no query, consistent with sitemap). | Low |
| 1.3 | Verify hreflang on key pages | Confirm Spanish and English alternates and x-default are correct on Home and rate pages (no broken or self-referencing hreflang). | Low |
| 1.4 | Fix PageMeta og:url if needed | Ensure `og:url` uses the same canonical URL (Helmet may use `href` vs `content`; validate in rendered output). | Low |
| 1.5 | robots.txt | Remove or document `Crawl-delay: 1` (Google ignores it; some other bots honor it—optional cleanup). | Low |

**Deliverable:** All target routes indexable with correct canonical and hreflang; no unintended noindex.

---

### Phase 2: Schema and sitemap improvements

**Goal:** Richer structured data and a maintainable sitemap; no change to rendering or routing.

| # | Task | Details | Risk |
|---|------|---------|------|
| 2.1 | Add Dataset or DataFeed schema for rate data | On Home (and optionally `/datos-historicos`), add a schema.org `Dataset` or a standards-compliant `DataFeed` describing the blue rate time series (name, description, update frequency, temporal coverage, sameAs/url). Do not remove existing JSON-LD. | Low |
| 2.2 | Validate existing JSON-LD | Run key URLs through Google Rich Results Test / schema validator; fix any errors (e.g. required properties, wrong types). Ensure FAQ, Organization, WebApplication are valid. | Low |
| 2.3 | Sitemap automation | Integrate sitemap generation into build or deploy: e.g. `npm run generate-sitemap` in CI after build, or a script that reads routes + blog slugs (from Supabase or a manifest) and writes `sitemap.xml` to `frontend/public` or `frontend/dist`. | Low |
| 2.4 | Sitemap lastmod | When generating sitemap, set `lastmod` from file mtime, git log, or CMS publish date (blog). Avoid static future dates. | Low |
| 2.5 | Optional: Sitemap index | If sitemap grows large (e.g. many blog posts), add a sitemap index and split URLs into multiple sitemaps (e.g. static, blog). | Low |

**Deliverable:** Valid, richer structured data on key pages; sitemap that stays up to date with content.

---

### Phase 3: Crawlability and pre-rendering improvements

**Goal:** Ensure crawlers receive full HTML and critical meta for the most important URLs.

| # | Task | Details | Risk |
|---|------|---------|------|
| 3.1 | Choose pre-render approach | Pick a Vite-compatible pre-render plugin (e.g. `vite-plugin-prerender`) or a headless script that loads the built SPA and dumps HTML for a list of routes. | Medium (new build step) |
| 3.2 | Pre-render route list | Start with: `/`, `/dolar-blue-hoy`, `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia`, `/bolivian-blue`, `/que-es-dolar-blue`, `/calculadora`. Ensure output directory structure matches Vercel (e.g. `dolar-blue-hoy/index.html`). | Medium |
| 3.3 | Rate data at pre-render time | Decide: use live API at build time (with short cache), or static placeholder for meta. If placeholder, keep wording generic (“updated every 15 min”) so it remains accurate. Do not change runtime fetch logic. | Medium |
| 3.4 | Test hydration | After pre-render, verify that the app hydrates correctly (no duplicate content, React Helmet does not break, charts and rate cards load). | Medium |
| 3.5 | Deploy and validate | Deploy to production; use “View Page Source” and Rich Results Test for pre-rendered URLs to confirm full HTML and meta. Monitor Core Web Vitals and errors. | Medium |

**Deliverable:** Pre-rendered static HTML for 5–7 critical routes; crawlers see full content and meta without relying on JS execution.

**Risky change flag:** Pre-render alters build output and deploy artifact. Test in a branch and on a staging environment before production. Rollback = disable pre-render and redeploy previous build.

---

### Phase 4: Internal linking and on-page enhancements

**Goal:** Strengthen topical clustering and clarity of intent without redesign.

| # | Task | Details | Risk |
|---|------|---------|------|
| 4.1 | Footer links | Add 2–4 high-value links to footer (e.g. “Dólar hoy” → `/dolar-blue-hoy`, “Datos históricos” → `/datos-historicos`, “Calculadora” → `/calculadora` if not already there). Keep existing footer links. | Low |
| 4.2 | Rate page cross-links | On each rate page (e.g. DolarBlueHoy, CuantoEstaDolarBolivia), add a short “Ver también” or “Más información” block with links to: calculator, datos-historicos, que-es-dolar-blue, and the other main rate URL (e.g. “En vivo” ↔ “Hoy”). Use existing components/styles where possible. | Low |
| 4.3 | Title and H1 differentiation | Review titles and H1s of overlapping routes (dolar-blue-hoy, dolar-paralelo-bolivia-en-vivo, cuanto-esta-dolar-bolivia). Ensure each is distinct and aligned with the route intent map (e.g. “Dólar Blue Hoy” vs “Dólar Paralelo Bolivia EN VIVO” vs “¿Cuánto Está el Dólar?”). No removal of pages. | Low |
| 4.4 | City pages | Ensure city pages (La Paz, Santa Cruz, Cochabamba) have unique intro or meta that references the city; link to national rate and calculator. | Low |
| 4.5 | Blog and noticias | In blog list and article template, add a consistent link to “Cotización actual” or “Dólar blue hoy” and to calculator. Same for noticias if applicable. | Low |

**Deliverable:** Clearer internal link graph and distinct positioning for overlapping rate pages; no UI redesign and no removal of routes.

---

## 6. Summary and next steps

- **Phase 1** fixes indexing and canonical/hreflang with minimal code touches.  
- **Phase 2** improves structured data and sitemap maintenance without changing how the app renders.  
- **Phase 3** introduces pre-rendering for critical routes to improve crawlability and meta visibility; this is the only phase with medium risk and should be tested on staging.  
- **Phase 4** improves internal linking and on-page differentiation to support the canonical strategy and reduce cannibalization.

**Before implementing:** Confirm this plan with stakeholders; then implement Phase 1 and Phase 2 first. Proceed to Phase 3 only after validating the pre-render approach in a non-production environment. Do not refactor exchange-rate logic, analytics, ads, alerts, charts, or Supabase usage; all changes are additive and targeted at SEO and crawlability.
