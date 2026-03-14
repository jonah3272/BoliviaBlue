# SEO Phase 5 – Static Shell Expansion Notes

**Date:** 2025-03-14  
**Scope:** Extend crawlable static shell coverage, add route-specific static JSON-LD, English-first shell for /bolivian-blue, and data-authority support text for /datos-historicos. No framework or business-logic changes.

---

## 1. Routes added to pre-rendering

| Route | Status |
|-------|--------|
| `/dolar-paralelo-bolivia-en-vivo` | **Added.** Shell: H1 "Dólar Paralelo Bolivia EN VIVO", intro, 5 internal links. Meta and static JSON-LD (WebPage + BreadcrumbList). |
| `/cuanto-esta-dolar-bolivia` | **Added.** Shell: H1 "¿Cuánto Está el Dólar en Bolivia?", intro (direct-answer), 4 internal links. Meta and static JSON-LD. |

Vercel rewrites added for both so requests to these paths serve the generated `dist/<path>/index.html`.

---

## 2. Shell content changes

### /bolivian-blue – English-first
- **Title:** "Bolivian Blue | Bolivia Blue Dollar Exchange Rate" (English).
- **Description:** "Bolivian Blue: real-time Bolivia blue dollar exchange rate. Updated every 15 min. Charts, calculator and news. Bolivian parallel market."
- **H1:** "Bolivian Blue – Bolivia Blue Dollar Exchange Rate".
- **Intro:** "This page is for readers looking for the Bolivia blue dollar rate in English. The Bolivian Blue is the parallel market rate used by millions in Bolivia; we update it every 15 minutes."
- **Nav:** English labels – "Home", "Blue dollar today", "Historical data", "Calculator"; `aria-label="Related links"`.
- Live app after hydration is unchanged; language toggle and React content behave as before.

### /datos-historicos – Data-authority support text
- **Description:** Now ends with "Misma fuente que la cotización en vivo." (same source as live quote).
- **Extra paragraph in shell:** "El gráfico y la tabla muestran compra, venta y promedio por período. Los datos provienen de la misma fuente que la cotización en vivo (actualización cada 15 min)."
- Aligns static shell with the page’s data-authority role and supports the Dataset schema (date range, what chart/table represent, relation to live quote).

### Other pre-rendered routes
- **/, /dolar-blue-hoy, /que-es-dolar-blue:** Unchanged shell copy; already aligned.
- **/dolar-paralelo-bolivia-en-vivo, /cuanto-esta-dolar-bolivia:** New shells as above.

---

## 3. Static JSON-LD added by route

All pre-rendered routes now get **minimal** static JSON-LD injected before `</head>` (in addition to the existing WebApplication block from the template). React may add more schema after hydrate; static block is foundational only.

| Route | Static JSON-LD |
|-------|----------------|
| `/` | WebPage (name, description, url, inLanguage es-BO, isPartOf, publisher), BreadcrumbList (Inicio → /). |
| `/dolar-blue-hoy` | WebPage, BreadcrumbList (Home → Dólar Blue Hoy). |
| `/dolar-paralelo-bolivia-en-vivo` | WebPage, BreadcrumbList (Home → Dólar Paralelo Bolivia EN VIVO). |
| `/cuanto-esta-dolar-bolivia` | WebPage, BreadcrumbList (Home → ¿Cuánto Está el Dólar?). |
| `/bolivian-blue` | WebPage (inLanguage en-US), BreadcrumbList (Home → Bolivian Blue). |
| `/que-es-dolar-blue` | WebPage, BreadcrumbList (Home → ¿Qué es el Dólar Blue?). |
| `/datos-historicos` | WebPage, BreadcrumbList (Home → Datos Históricos), **Dataset** (name, description, url, inLanguage, datePublished, temporalCoverage 2024-01-01/.., variableMeasured USD/BOB blue rate, creator, publisher). |

- **FAQPage:** Not added; static shells do not include visible FAQ content.
- **Dataset:** Only on /datos-historicos; description matches the new support text (chart/table, same source as live, 15 min).

---

## 4. Duplication intentionally accepted

- **BreadcrumbList:** Emitted both in static HTML (Phase 5) and by React (PageMeta). Search engines typically merge or ignore duplicates; static version guarantees crawlability without JS.
- **WebPage:** Same: static minimal WebPage + React may emit a richer WebPage or Article. Minimal static set is kept to avoid conflicts; duplication is acceptable.
- **WebApplication:** The template’s single WebApplication block remains in every generated file; we do not remove it. Route-specific WebPage + BreadcrumbList (and Dataset where used) are additive.

---

## 5. Limitations that remain

- **Language:** Static shell for /bolivian-blue is English-only. Other routes are Spanish-only in the shell. No multi-locale static shells.
- **og:locale / twitter:** Template’s `og:locale` and `language` meta stay as in the source (e.g. es_BO) for all routes; only title/description/canonical/og:title/og:description/og:url and twitter title/description/url are route-specific. So /bolivian-blue still has og:locale es_BO unless the template or script is extended.
- **Structured data:** No static FAQPage (shell has no FAQ). No Article or FinancialProduct in static HTML; those remain React-only.
- **Assets:** All generated HTML files reference the same JS/CSS bundles (root paths). Correct for SPA hydration.

---

## 6. Rollback considerations

- **Disable new routes only:** In `inject-seo-shell.cjs`, remove `/dolar-paralelo-bolivia-en-vivo` and `/cuanto-esta-dolar-bolivia` from the `otherPaths` array and from the `ROUTES` object; remove their rewrites from `vercel.json`. Existing pre-rendered routes continue to work.
- **Remove static JSON-LD only:** In `inject-seo-shell.cjs`, remove the `injectStaticJsonLd(html, routePath)` call (and the `getJsonLd` usage). Shells and meta remain; only the extra script blocks disappear.
- **Revert /bolivian-blue to Spanish shell:** Restore the previous Spanish title, description, H1, intro, and nav in the `ROUTES['/bolivian-blue']` entry.
- **Revert /datos-historicos support text:** Remove the second `<p>` from the datos-historicos shell and the Dataset from `getJsonLd` if desired.

---

## 7. Files changed

| File | Change |
|------|--------|
| `frontend/scripts/inject-seo-shell.cjs` | Added ROUTES for `/dolar-paralelo-bolivia-en-vivo`, `/cuanto-esta-dolar-bolivia`. Updated `/bolivian-blue` to English title, description, H1, intro, nav. Updated `/datos-historicos` shell with support paragraph and description tweak. Added `buildStaticJsonLd`, `DATASET_DATOS`, `getJsonLd` per route, `injectStaticJsonLd()`. All routes now get static WebPage + BreadcrumbList; datos-historicos also gets Dataset. Added `twitter:url` to `replaceMeta`. |
| `vercel.json` | Rewrites for `/dolar-paralelo-bolivia-en-vivo` and `/cuanto-esta-dolar-bolivia` to their respective `index.html`. |

No changes to React components, routing, or API logic.
