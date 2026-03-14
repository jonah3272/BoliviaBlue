# SEO Phase 2 – Implementation Notes

**Date:** 2025-03-14  
**Scope:** Search intent ownership and cannibalization reduction. No route deletions, no redirects, no UI redesign, no business logic or Supabase changes.

---

## 1. Files changed

| File | Changes |
|------|--------|
| `SEO_PHASE_2_INTENT_MAP.md` | **New.** Intent map for 13 URLs: primary/secondary keywords, intent, language, page role, overlap risk, differentiation recommendation. |
| `frontend/src/pages/Home.jsx` | Hub positioning: H1 “Dólar Blue Bolivia – Cotización en Tiempo Real y Herramientas”; intro “Tu fuente principal…”; short line above chart; new “También en esta web” related links (4 links). |
| `frontend/src/pages/DolarBlueHoy.jsx` | H1 “Cotización del Dólar Blue Hoy – Bolivia”; intro line “Esta es la cotización del dólar blue hoy…”; chart intro with link to Datos históricos; related section expanded to 4 (added EN VIVO, Datos históricos). |
| `frontend/src/pages/DolarParaleloBoliviaEnVivo.jsx` | Intro line “Cotización… EN VIVO… actualizamos cada 15 minutos”; chart section intro “Evolución del tipo de cambio en el tiempo”; new “También te puede interesar” related section (4 links); added `Link` import. |
| `frontend/src/pages/CuantoEstaDolarBolivia.jsx` | Intro line “Respuesta directa: el precio actual…”; chart intro with link to Datos históricos; related section expanded to 4 (added EN VIVO, Datos históricos). |
| `frontend/src/pages/BolivianBlue.jsx` | English-only block: “This page is for readers looking for the Bolivia blue dollar rate in English…”; tightened Spanish/EN first paragraph; “Recursos Adicionales” → “También te puede interesar”, third link changed from `/bolivia-blue-rate` to `/datos-historicos`. |
| `frontend/src/pages/QueEsDolarBlue.jsx` | Intro paragraph: added sentence with links to homepage and “dólar blue hoy” for current quote; “Ver gráficos históricos” / “View historical charts” links changed from `/bolivia-blue-rate` to `/datos-historicos`; related section expanded to 4 (added Datos históricos). |
| `frontend/src/pages/DatosHistoricos.jsx` | Subtitle “Archivo de cotizaciones pasadas para analizar tendencias”; intro “Aquí puedes ver y analizar el histórico…”; new “También en esta web” related block (4 links) above Time Range Selector. |
| `frontend/index.html` | Static fallback meta aligned with Phase 1 homepage: title “Dólar Blue Bolivia en Tiempo Real | Cotización Cada 15 Min”; description and OG/Twitter description updated to match. |

---

## 2. How each page was differentiated

- **`/` (Home)**  
  - **Role:** Main authority hub for broad “dólar blue Bolivia” and “Bolivia blue” queries.  
  - **H1:** “Dólar Blue Bolivia – Cotización en Tiempo Real y Herramientas” / “Bolivia Blue Dollar – Live Rate & Tools” so it reads as the main dashboard, not “just today” or “just live.”  
  - **Intro:** “Tu fuente principal para el dólar blue en Bolivia: cotización cada 15 min, gráficos históricos, calculadora y noticias. Sin registro.”  
  - **Chart:** Short line above: “Evolución del tipo de cambio (arriba: cotización actual).”  
  - **Related:** “También en esta web” with 4 links (dólar blue hoy, cuánto está el dólar, datos históricos, calculadora).

- **`/dolar-blue-hoy`**  
  - **Role:** “Today’s” rate: calendar-day, current quote.  
  - **H1:** “Cotización del Dólar Blue Hoy – Bolivia” / “Blue Dollar Quote Today – Bolivia.”  
  - **Intro:** “Esta es la cotización del dólar blue hoy en Bolivia, actualizada cada 15 minutos.”  
  - **Chart:** Line with link to “Datos históricos” for full history.  
  - **Related:** 4 links (EN VIVO, ¿Cuánto está?, Datos históricos, Calculadora).

- **`/dolar-paralelo-bolivia-en-vivo`**  
  - **Role:** “Live” rate: real-time feel, 15 min updates.  
  - **Intro:** “Cotización del dólar paralelo Bolivia EN VIVO. Aquí ves la cotización en tiempo real; actualizamos cada 15 minutos con datos de Binance P2P.”  
  - **Chart:** “Evolución del tipo de cambio en el tiempo.”  
  - **Related:** New section “También te puede interesar” (dólar blue hoy, cuánto está, calculadora, qué es dólar blue).

- **`/cuanto-esta-dolar-bolivia`**  
  - **Role:** Question-led: “How much is the dollar?” with direct answer.  
  - **Intro:** “Respuesta directa: el precio actual del dólar blue está abajo; usa la calculadora para cualquier monto.”  
  - **Chart:** Line with link to Datos históricos.  
  - **Related:** 4 links (calculadora, dólar blue hoy, EN VIVO, datos históricos).

- **`/bolivian-blue`**  
  - **Role:** Spanish “Bolivian Blue” + **deliberate English landing** for “Bolivia blue dollar rate.”  
  - **EN:** New block: “This page is for readers looking for the **Bolivia blue dollar rate** in English. The Bolivian Blue is the parallel market rate used by millions in Bolivia; we update it every 15 minutes.”  
  - **Copy:** First paragraph tightened in both languages (market term, “millions use it,” BCB contrast).  
  - **Related:** “Recursos Adicionales” → “También te puede interesar”; third card fixed from `/bolivia-blue-rate` (self) to `/datos-historicos` (Datos históricos).

- **`/que-es-dolar-blue`**  
  - **Role:** Educational: what it is, how it works; not the “today” rate.  
  - **Intro:** Added sentence: “Esta guía explica qué es, cómo funciona y por qué importa; para la cotización actual, consulta la página principal o dólar blue hoy.” (With links.)  
  - **Internal links:** “Ver gráficos históricos” / “View historical charts” updated from `/bolivia-blue-rate` to `/datos-historicos`.  
  - **Related:** 4 links (dólar blue hoy, cuánto está, datos históricos, comprar dólares).

- **`/datos-historicos`**  
  - **Role:** Data archive: past quotes, trends, analysis.  
  - **Subtitle:** “Archivo de cotizaciones pasadas para analizar tendencias.”  
  - **Intro:** “Aquí puedes ver y analizar el histórico del tipo de cambio del dólar blue en Bolivia: tendencias, promedios y estadísticas desde 2024.”  
  - **Related:** New “También en esta web” (cotización actual /, dólar blue hoy, calculadora, qué es dólar blue).

---

## 3. Internal links added

- **Home:** “También en esta web” → `/dolar-blue-hoy`, `/cuanto-esta-dolar-bolivia`, `/datos-historicos`, `/calculadora`.  
- **DolarBlueHoy:** Chart line → `/datos-historicos`; related → `/dolar-paralelo-bolivia-en-vivo`, `/datos-historicos` (plus existing cuánto está, calculadora, que-es).  
- **DolarParaleloBoliviaEnVivo:** New related block → `/dolar-blue-hoy`, `/cuanto-esta-dolar-bolivia`, `/calculadora`, `/que-es-dolar-blue`.  
- **CuantoEstaDolarBolivia:** Chart line → `/datos-historicos`; related → `/dolar-paralelo-bolivia-en-vivo`, `/datos-historicos` (plus calculadora, dólar blue hoy).  
- **BolivianBlue:** Resource card → `/datos-historicos` (replacing broken `/bolivia-blue-rate`).  
- **QueEsDolarBlue:** Intro → `/`, `/dolar-blue-hoy`; list item → `/datos-historicos` (replacing `/bolivia-blue-rate`); related → `/datos-historicos` added.  
- **DatosHistoricos:** New block → `/`, `/dolar-blue-hoy`, `/calculadora`, `/que-es-dolar-blue`.

All links use descriptive anchor text and support topical clusters (rate pages ↔ calculator ↔ historical data ↔ educational).

---

## 4. Overlap that still remains

- **Rate pages (/, /dolar-blue-hoy, /dolar-paralelo-bolivia-en-vivo, /cuanto-esta-dolar-bolivia, /bolivian-blue)**  
  All still show the same live rate and a chart. Differentiation is by **positioning** (hub vs today vs live vs question vs brand/EN) and **intro/headings**, not by removing content. Some keyword overlap is intentional (e.g. “dólar blue,” “cotización”) so the site can compete for variants; each URL now has a distinct H1 and intro so engines can separate intent.

- **City pages (/dolar-blue-la-paz, etc.)**  
  Not modified in Phase 2. They still share the same national rate and similar structure; overlap with national pages remains. The intent map recommends keeping them as “reference for [city]” with same link pattern; future phase could add one sentence of local framing if desired.

- **English:**  
  `/bolivian-blue` is the main EN landing; `/blue-dollar-bolivia` exists as a separate route. No redirect was added; both remain indexable. If desired later, one could canonicalize one to the other or consolidate after testing.

---

## 5. Recommended future actions (not implemented)

- **Redirects / canonicals (do not implement yet)**  
  - Consider, in a later phase, whether to 301 any duplicate-style URLs (e.g. `/bolivia-blue-rate` already redirects to `/bolivian-blue`; no new redirects added here).  
  - If `/blue-dollar-bolivia` and `/bolivian-blue` both target English, consider a single canonical (e.g. one canonical to the other) after measuring impact.  
  - No redirects or canonical changes were made in Phase 2.

- **City pages**  
  Add a single line of local framing (e.g. “Misma cotización nacional; referencia para La Paz”) and the same related-links pattern (main rate, calculadora, datos históricos) for consistency and topical reinforcement.

- **Sitemap / crawl**  
  Ensure sitemap includes all key URLs and that internal links are crawlable (no JS-only links; all links are `<Link to="...">`).

- **Monitoring**  
  After deployment, monitor Search Console for impressions/clicks by URL and query to confirm the right page gains for “dólar blue hoy,” “dolar paralelo bolivia en vivo,” “cuánto está el dólar,” “bolivian blue,” “datos históricos,” etc.

---

## 6. Summary

Phase 2 added an intent map (13 URLs), differentiated the 7 target pages via H1s, intros, and short supporting copy, strengthened internal linking with descriptive anchors, made the homepage the clear hub and `/bolivian-blue` a deliberate English landing, added or updated related-links sections, and aligned `index.html` static meta with the homepage. No routes were removed, no redirects added, and no business logic or Supabase fetching was changed.
