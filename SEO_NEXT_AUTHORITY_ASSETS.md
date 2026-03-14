# SEO Next: Authority-Building Product Opportunities

**Purpose:** Read-only assessment of the next highest-leverage product features or public assets that could help Bolivia Blue earn more links, citations, trust, and rankings.  
**Scope:** Analysis and planning only; no code or design changes.

---

## Current state (summary)

- **Routes:** 40+ routes including hub (/), rate pages (dolar-blue-hoy, dolar-paralelo-bolivia-en-vivo, cuanto-esta-dolar-bolivia, bolivian-blue), educational (que-es-dolar-blue), data (datos-historicos, calculadora), city pages (La Paz, Santa Cruz, Cochabamba), API docs, Data Source, Blog, News, Monthly Report (by month/year), alerts, newsletter, chat.
- **Data:** Supabase `rates` (current + history with t, buy, sell, mid, official_*), `news`, `blog_articles`; backend also serves monthly reports (DB-driven), alerts, newsletter.
- **Public-facing today:** Live rate + chart, historical chart + table, client-side CSV download (current range only), calculator, API (blue-rate, blue-history, news, health), Data Source page (methodology + attribution + “contact for API”), ApiDocs, monthly report per month/year (no index page for reportes-mensuales), rate alerts, newsletter signup.

---

## Ranked authority-building opportunities

*(1 = highest leverage for organic growth)*

---

### 1. Downloadable historical CSV/JSON (server-backed)

**What it is:** A public, stable URL (e.g. `/api/historical-data.csv` or `/datos-historicos/descargar`) that returns blue-dollar historical data in CSV or JSON for a defined range (e.g. last 30 days, last year, or “all” with a sensible cap), with clear license/attribution.

**Why it helps SEO/authority:** Positions Bolivia Blue as a citable data source. Dataset schema already references a distribution URL; today that URL doesn’t exist. Researchers, journalists, and tools can link to and cite the dataset. Supports “data authority” and topical expertise.

**Implementation complexity:** Medium. Backend endpoint that reads from existing `rates` (or cached aggregate), formats CSV/JSON, sets cache headers and CORS. Optional: rate limit or simple query params (range, format).

**SEO upside:** High. Unique, linkable asset; supports Dataset and “data provider” positioning; targets “dólar blue bolivia datos históricos”, “blue dollar bolivia data download”.

**Linkability:** High. Media, researchers, and developers naturally link to or cite a stable data URL.

**Language:** Both (page and filename can be language-neutral; documentation in ES/EN).

**AI search visibility:** High. Structured, factual dataset is exactly what AI overviews and citations use; clear attribution and date range help.

---

### 2. Methodology / data source transparency page (deepened)

**What it is:** A dedicated, crawlable page (or substantial section) that explains in plain language: source (Binance P2P), how the rate is computed (e.g. median of buy/sell), update frequency (15 min), what “blue” means in Bolivia, and how it differs from the official rate. Optionally: sample raw inputs, formula, or link to Binance P2P.

**Why it helps:** Trust and E-E-A-T. Google and users reward transparency. “Fuente de datos” already exists but can be expanded into a single “methodology” destination that journalists and editors link to when citing the rate.

**Implementation complexity:** Low–medium. Content and light structure; no new data pipelines. Could extend `/fuente-de-datos` or add `/metodologia` with internal links from Data Source and footer.

**SEO upside:** High. Targets “fuente dólar blue bolivia”, “cómo se calcula dólar blue”, “metodología tipo cambio bolivia”. Strengthens the whole site as an authority.

**Linkability:** High. News articles and reports that cite “boliviablue.com” can link to methodology for credibility.

**Language:** Both (ES primary; EN for international citations).

**AI search visibility:** High. Clear, factual methodology is frequently surfaced in AI answers and “sources.”

---

### 3. Embeddable rate widget

**What it is:** A small iframe or script-based widget that other sites can embed to show the current blue dollar rate (and optional “updated at” and link back to boliviablue.com). Documentation page with copy-paste code and attribution requirements.

**Why it helps:** Every embed is a placement and potential backlink. News sites, blogs, and financial pages can embed the rate instead of copying a number, which encourages attribution and links.

**Implementation complexity:** Medium. New route (e.g. `/widget` or `/embed`) that renders a minimal, cacheable HTML fragment; CORS/iframe headers; docs and attribution policy.

**SEO upside:** Medium–high. Indirect: more referrals and links; widget page can rank for “widget dólar blue bolivia”, “embed tipo cambio bolivia”.

**Linkability:** High. Embeddable assets are linked from “how to add the rate” pages and from embedders’ credits.

**Language:** Both (widget language-neutral or configurable; docs ES/EN).

**AI search visibility:** Medium. Less directly cited than datasets or methodology, but increases distribution and brand mentions.

---

### 4. Monthly exchange-rate reports (index + SEO)

**What it is:** A proper `/reportes-mensuales` (or `/reporte-mensual`) index page that lists available monthly reports with titles, dates, and links to each report. Each report URL is already supported (`/reporte-mensual/:month/:year`); the missing piece is a crawlable index and optional RSS/sitemap for new reports.

**Why it helps:** Monthly reports are repeatable, date-rich content. An index makes them discoverable and linkable; new reports can be shared and linked over time. Strengthens “authority” and “research” positioning.

**Implementation complexity:** Low–medium. One new route and page that calls `GET /api/monthly-reports` and renders a list; ensure report URLs are in sitemap and have good meta.

**SEO upside:** High over time. Targets “reporte dólar blue mensual”, “resumen mensual tipo cambio bolivia”; each report is a long-tail page.

**Linkability:** Medium–high. Media and newsletters can link to “this month’s report” or the index.

**Language:** Both (API supports lang; index and reports in ES/EN).

**AI search visibility:** Medium–high. Summaries and dates are good for “what happened in [month]” type queries.

---

### 5. API landing page improvements

**What it is:** A dedicated “API” or “Developers” landing page (could be an enhanced `/api-docs` or a separate `/api`) that highlights: free access, no key required (or simple registration if introduced), main endpoints, use cases (e.g. “for apps”, “for research”), and a clear link to methodology and terms. Optional: code samples, Postman/OpenAPI, and “used by” or example projects.

**Why it helps:** Developers and tools are high-intent linkers. A clear, trustworthy API story increases adoption and citations (e.g. “data via boliviablue.com API”).

**Implementation complexity:** Low–medium. Mostly content and structure; optional OpenAPI or examples. No change to existing API behavior required.

**SEO upside:** Medium–high. “API dólar blue bolivia”, “bolivia blue dollar API” are existing intents; a stronger landing improves relevance and conversions.

**Linkability:** High. Developer docs and tool listings often link to API home and docs.

**Language:** Both (technical audience often EN; local devs ES).

**AI search visibility:** Medium. API docs are commonly cited when answering “how to get Bolivia blue rate programmatically.”

---

### 6. Journalist / media data snapshots

**What it is:** A “Press” or “For media” page (or section on Data Source) that offers: one-click “current rate snapshot” (e.g. copy-paste sentence: “Según Bolivia Blue con Paz, el dólar blue en Bolivia está en X BOB (compra) y Y BOB (venta) a las [time].”), optional weekly or monthly summary in text form for citation, and contact for custom requests.

**Why it helps:** Reduces friction for journalists to cite the site correctly; standardized wording increases consistent attribution and links.

**Implementation complexity:** Low. Static template + live rate injection; optional automated “weekly summary” if monthly reports or history is reused.

**SEO upside:** Medium. Supports “fuente datos periodistas”, “dólar blue bolivia medios”; reinforces Data Source page.

**Linkability:** High. Directly designed to be linked and quoted.

**Language:** Both (ES for local press; EN for international).

**AI search visibility:** Medium. Clear “for media” content can be surfaced in “sources for journalists” type answers.

---

### 7. City / market contextualization (light)

**What it is:** One or two short, visible sentences on each city page (La Paz, Santa Cruz, Cochabamba) that explain that the rate is national (same across Bolivia) and that the page is a “reference for [city]” (e.g. “Misma cotización nacional; referencia para La Paz”). Optionally: local context (e.g. “en La Paz el dólar blue se negocia en…” without inventing city-specific rates).

**Why it helps:** Aligns content with search intent (“dólar blue La Paz”) and reduces thin-content risk while keeping a single data source. Differentiates city URLs from national ones without fake local data.

**Implementation complexity:** Low. Copy and optional small schema (e.g. Place or same WebPage with areaServed).

**SEO upside:** Medium. Better satisfaction for “dólar blue [city]” queries; strengthens city pages as valid landing pages.

**Linkability:** Low–medium. Mostly internal and UX; some local sites might link to the city page.

**Language:** ES primary (city queries are mostly ES).

**AI search visibility:** Low–medium. Helps clarify “one national rate” in answers.

---

### 8. Comparison tables (blue vs official, or vs other sources)

**What it is:** A dedicated comparison page or block that shows: blue buy/sell vs official buy/sell, difference in BOB and %, and optionally “vs other platforms” (with clear methodology: “we use Binance P2P median”). Kept factual and updated from existing data.

**Why it helps:** Targets “diferencia dólar blue oficial”, “dólar blue vs oficial Bolivia”; supports featured snippets and “compare” intent. Builds authority through transparency.

**Implementation complexity:** Low–medium. Data already exists (official_buy, official_sell); UI and copy; avoid misleading comparisons.

**SEO upside:** High for comparison queries. Strong snippet potential.

**Linkability:** Medium. Cited in articles that explain the gap between blue and official.

**Language:** Both.

**AI search visibility:** High. Comparison and “difference” are common AI query types.

---

### 9. Alerts / newsletter as SEO assets

**What it is:** Lightweight, public-facing “product” pages that explain what rate alerts and the newsletter offer (e.g. “Get the blue dollar rate by email when it crosses a threshold” / “Monthly summary in your inbox”), with clear value prop and link to Data Source or methodology. No need to expose user data; focus on “why subscribe” and “data from Bolivia Blue.”

**Why it helps:** Alerts and newsletter are retention tools; framing them as “data products” with attribution (e.g. “Data: Bolivia Blue con Paz”) can encourage sharing and links when users forward or cite the source.

**Implementation complexity:** Low. Copy and links; optional dedicated `/alertas` and `/boletin` (or use existing flows with better landing copy).

**SEO upside:** Medium. “Alertas dólar blue”, “newsletter tipo cambio bolivia” are niche but aligned.

**Linkability:** Low–medium. Mostly user-driven sharing; some roundups link to “best alert tools.”

**Language:** Both.

**AI search visibility:** Low–medium. Less central than datasets or methodology.

---

### 10. Public changelog or market summaries

**What it is:** A simple “Changelog” or “Market updates” page (or section) that lists: notable changes (e.g. “New: historical CSV download”), methodology tweaks, or short “market summary” bullets (e.g. “January 2025: blue dollar averaged X BOB”). Can be manual at first or driven from monthly reports / history.

**Why it helps:** Signals an active, maintained product; gives linkable “moments” (e.g. “as of Bolivia Blue’s March update”). Supports freshness and E-E-A-T.

**Implementation complexity:** Low–medium. Manual or semi-automated from existing data; one new route and list view.

**SEO upside:** Medium over time. “Cambios bolivia blue”, “resumen mercado dólar blue”; supports brand queries.

**Linkability:** Medium. Product updates and “what’s new” pages get linked in roundups and by power users.

**Language:** Both.

**AI search visibility:** Medium. “Latest updates from Bolivia Blue” can be cited.

---

### 11. Dedicated “English” data hub (if scaling EN)

**What it is:** A single English-first hub (e.g. `/en` or enhanced `/bolivian-blue`) that aggregates: current rate, link to historical data, methodology link, API link, and “For media” in English. Not a full locale switch; a clear “English readers start here” entry point.

**Why it helps:** /bolivian-blue is already the main EN landing; doubling down with a clear hub can capture “Bolivia blue dollar rate”, “Bolivia exchange rate” and improve EN visibility and links from English-language sites.

**Implementation complexity:** Low if limited to one page; medium if multiple EN subpages. Risk of duplication; best as one strong page + internal links.

**SEO upside:** Medium–high for EN. Complements existing ES dominance.

**Linkability:** High from English media and tools.

**Language:** EN.

**AI search visibility:** High for EN queries.

---

### 12. RSS or JSON feed for rate / reports

**What it is:** An RSS or JSON feed (e.g. `/api/feed` or `/feed`) that exposes: latest rate with timestamp, and optionally new monthly report titles and URLs. Enables feed readers and third-party “Bolivia Blue feed” integrations.

**Why it helps:** Feeds are linkable and can be listed in directories; some journalists and tools consume feeds for “latest data” integrations. Complements API and Dataset.

**Implementation complexity:** Low–medium. One backend route; cache; optional discovery link in HTML head.

**SEO upside:** Low–medium. Indirect (more distribution and integrations); feed URL can be linked from docs.

**Linkability:** Medium. Feed directories and integrations may link.

**Language:** Language-neutral feed; titles can be ES/EN.

**AI search visibility:** Low. Feeds are less often directly cited in AI answers.

---

## Top 3 recommended to build next

1. **Downloadable historical CSV/JSON (server-backed)**  
   Fills the Dataset distribution gap, creates a single citable URL, and supports researchers and media. Highest linkability and AI visibility with moderate build cost.

2. **Methodology / data source transparency page (deepened)**  
   Builds E-E-A-T and trust with minimal new logic; extends the existing Data Source story. Fast to ship and strongly supports all other data-related content.

3. **Monthly reports index page (`/reportes-mensuales`)**  
   Unlocks existing monthly report content for discovery and search; low effort (one page + API), improves long-tail and repeat traffic, and supports “report” and “summary” queries.

---

## Dependencies and data gaps

- **Historical CSV/JSON:** Backend must expose an endpoint (or proxy to Supabase with safe limits). Dataset schema can then point `distribution.contentUrl` to this URL. No new Supabase tables; reuse `rates` and existing range logic.
- **Monthly reports index:** Depends on `GET /api/monthly-reports` and (if reports are stored in DB) on monthly reports being populated; otherwise the index can still exist and show “no reports yet” or only future reports.
- **Methodology:** No data gap; only content and structure. Optional: link to Binance P2P or a short “sample calculation” if desired.
- **Widget:** Requires allowing iframe embedding (CSP/headers) and a minimal HTML route; no new data.
- **City pages:** No new data; only copy clarifying “national rate, reference for [city].”
- **Comparison (blue vs official):** Data already in `rates` (official_buy, official_sell); ensure backend returns them on blue-rate and blue-history where appropriate.

---

## Summary table

| # | Opportunity                     | Complexity | SEO upside | Linkability | Best for   |
|---|----------------------------------|------------|------------|-------------|------------|
| 1 | Historical CSV/JSON (server)     | Medium     | High       | High        | ES + EN, AI |
| 2 | Methodology page (deepened)     | Low–Medium | High       | High        | ES + EN, AI |
| 3 | Embeddable rate widget           | Medium     | Med–High   | High        | ES + EN    |
| 4 | Monthly reports index           | Low–Medium | High       | Med–High    | ES + EN, AI |
| 5 | API landing improvements         | Low–Medium | Med–High   | High        | ES + EN    |
| 6 | Journalist data snapshots        | Low        | Medium     | High        | ES + EN    |
| 7 | City contextualization           | Low        | Medium     | Low–Med     | ES         |
| 8 | Comparison tables                | Low–Medium | High       | Medium      | ES + EN, AI |
| 9 | Alerts/newsletter as assets      | Low        | Medium     | Low–Med     | ES + EN    |
|10 | Changelog / market summaries      | Low–Medium | Medium     | Medium      | ES + EN    |
|11 | English data hub                  | Low–Medium | Med–High (EN) | High    | EN, AI     |
|12 | RSS/JSON feed                     | Low–Medium | Low–Med    | Medium      | Neutral    |
