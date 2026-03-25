# GA4 analytics event plan — boliviablue.com

This document describes the **product-level** custom events implemented via `frontend/src/utils/analyticsEvents.js` (wrappers around `trackEvent` / `gtag` in `frontend/src/utils/analytics.js`). The site also sends **legacy** events (`calculator_usage`, `alert_submission`, `chart_time_range_change`, scroll depth, etc.); those are unchanged unless noted.

## Existing GA4 setup (summary)

- **Measurement ID:** `G-WRN4D234F2` (loaded in `frontend/index.html`).
- **Page views:** `usePageTracking` calls `trackPageView` on route changes.
- **Why “key events” looked empty:** In GA4, events only appear as key events/conversions after you **mark them** in **Admin → Data display → Events** (or the conversions flow). Custom events must exist in data first, then be toggled as key events.

## Debug mode (development / QA)

- Set **`localStorage.bb_analytics_debug = "1"`** in the browser console, **or** set env **`VITE_ANALYTICS_DEBUG=true`** when running Vite.
- All `trackEvent` calls then log to the console as **`[GA4] eventName params`** (including when `gtag` is missing locally).
- Use GA4 **DebugView** with a debug-enabled device/session per Google’s documentation.

---

## Recommended GA4 key events (mark in GA4 UI)

| Event | Rationale |
|--------|-----------|
| `rate_alert_submitted` | Strong intent: user created a price alert. |
| `newsletter_signup_completed` | Lead / retention signal. |
| `historical_download_csv` | Data product engagement (researchers, power users). |
| `historical_download_json` | Same as CSV; JSON often indicates API/integration interest. |

Optional secondary key events (depending on business priorities): `calculator_used`, `comparison_page_viewed`, `outbound_source_clicked` (affiliate funnel).

---

## Event catalog

Parameters listed are **in addition to** `event_timestamp` (added by `trackEvent`) and usually **`page_path`** (pathname + query), unless noted.

### `rate_alert_opened`

| Field | Value |
|--------|--------|
| **Fires** | Once when the rate alert block scrolls into view (~15% visible). |
| **File** | `frontend/src/components/RateAlertForm.jsx` |
| **Parameters** | `language`, `page_type`: `rate_alert`, `page_path` |
| **Business question** | Are visitors reaching and noticing the alert feature? |

### `rate_alert_submitted`

| Field | Value |
|--------|--------|
| **Fires** | On successful API response for creating an alert. |
| **File** | `frontend/src/components/RateAlertForm.jsx` |
| **Parameters** | `language`, `page_type`: `rate_alert`, `alert_type`, `direction`, `threshold`, `page_path` |
| **Also** | Legacy `alert_submission` still fires (unchanged). |
| **Business question** | How many users complete alert signup, and with which alert settings? |
| **Key event** | **Yes (recommended)** |

### `calculator_used`

| Field | Value |
|--------|--------|
| **Fires** | When a meaningful conversion runs (same conditions as existing `trackCalculatorUsage`). |
| **File** | `frontend/src/components/CurrencyCalculator.jsx` |
| **Parameters** | `language`, `page_type`: `calculator`, `from_currency`, `to_currency`, `use_official` (boolean), `page_path` |
| **Also** | Legacy `calculator_usage` still fires. |
| **Business question** | Is the calculator a core engagement tool, and do users toggle official vs blue? |

### `historical_download_csv`

| Field | Value |
|--------|--------|
| **Fires** | (1) Click any server CSV link on `/datos-historicos`; (2) “Download CSV” for the selected period (client-generated file). |
| **File** | `frontend/src/pages/DatosHistoricos.jsx` |
| **Parameters** | `language`, `page_type`: `historical`, `range_selected` (e.g. `30d`, `1M`, `90d`), `format`: `csv`, `source`: `server_api` \| `client_generated`, `page_path` |
| **Business question** | Who exports data, for which window, from API vs on-page? |
| **Key event** | **Yes (recommended)** |

### `historical_download_json`

| Field | Value |
|--------|--------|
| **Fires** | Click a server JSON download link on `/datos-historicos`. |
| **File** | `frontend/src/pages/DatosHistoricos.jsx` |
| **Parameters** | `language`, `page_type`: `historical`, `range_selected`, `format`: `json`, `source`: `server_api`, `page_path` |
| **Business question** | JSON clicks often indicate developers or automation. |
| **Key event** | **Yes (recommended)** |

### `comparison_page_viewed`

| Field | Value |
|--------|--------|
| **Fires** | Once per mount of `/comparacion`. |
| **File** | `frontend/src/pages/Comparison.jsx` |
| **Parameters** | `language`, `page_type`: `comparison`, `page_path` |
| **Business question** | Is the blue vs official / competitor story attracting readers? |

### `methodology_page_viewed`

| Field | Value |
|--------|--------|
| **Fires** | Once per mount of `/fuente-de-datos`. |
| **File** | `frontend/src/pages/DataSource.jsx` |
| **Parameters** | `language`, `page_type`: `methodology`, `page_path` |
| **Business question** | Are users seeking trust / methodology (journalists, researchers)? |

### `api_docs_viewed`

| Field | Value |
|--------|--------|
| **Fires** | Once per mount of `/api-docs`. |
| **File** | `frontend/src/pages/ApiDocs.jsx` |
| **Parameters** | `language`, `page_type`: `api_docs`, `page_path` |
| **Business question** | Is the API documentation funnel healthy? |

### `monthly_report_viewed`

| Field | Value |
|--------|--------|
| **Fires** | When a monthly report loads successfully (once per `month`/`year`/`language` combination in-session for that view). |
| **File** | `frontend/src/pages/MonthlyReport.jsx` |
| **Parameters** | `language`, `page_type`: `monthly_report`, `report_month`, `report_year`, `page_path` |
| **Business question** | Which reports and languages drive readership? |

### `chart_range_changed`

| Field | Value |
|--------|--------|
| **Fires** | User selects a different time range on the main blue chart, or on `/datos-historicos` period buttons. |
| **Files** | `frontend/src/components/BlueChart.jsx` (`chart_context`: `blue_chart`); `frontend/src/pages/DatosHistoricos.jsx` (`chart_context`: `historical_page`) |
| **Parameters** | `language`, `range_previous`, `range_selected`, `chart_context`, `page_path` |
| **Also** | Legacy `chart_time_range_change` may still fire from other code paths using `trackChartTimeRangeChange`. |
| **Business question** | Which horizons do users care about (1D vs ALL, etc.)? |

### `related_link_clicked`

| Field | Value |
|--------|--------|
| **Fires** | Internal nav from curated “related” / footer link clusters on comparison, methodology, and historical pages. |
| **Files** | `frontend/src/pages/Comparison.jsx` (`page_type`: `comparison`), `frontend/src/pages/DataSource.jsx` (`page_type`: `methodology`), `frontend/src/pages/DatosHistoricos.jsx` (`page_type`: `historical`) |
| **Parameters** | `language`, `destination` (path), `link_label` (stable id), `page_type`, `page_path` |
| **Business question** | Where do high-intent pages send users next? |

### `language_switched`

| Field | Value |
|--------|--------|
| **Fires** | When the user changes site language in the UI. |
| **File** | `frontend/src/contexts/LanguageContext.jsx` → `trackLanguageSwitched` |
| **Parameters** | `from_language`, `to_language`, `page_type`: `global`, `page_path` |
| **Note** | Replaces the old `language_switch` event name from `trackLanguageSwitch` (removed from `analytics.js` to avoid duplicate naming). |
| **Business question** | What is the ES/EN mix and do users switch mid-session? |

### `newsletter_signup_started`

| Field | Value |
|--------|--------|
| **Fires** | First focus or first change on the newsletter email field (once per attempt until successful submit resets tracking). |
| **File** | `frontend/src/components/NewsletterSignup.jsx` |
| **Parameters** | `language`, `source` (prop, e.g. `homepage`), `page_path` |
| **Business question** | Funnel top: how many users start the newsletter form? |

### `newsletter_signup_completed`

| Field | Value |
|--------|--------|
| **Fires** | Successful `/api/newsletter/subscribe` response. |
| **File** | `frontend/src/components/NewsletterSignup.jsx` |
| **Parameters** | `language`, `source`, `page_path` |
| **Note** | Previous broken `trackEvent('newsletter', 'subscribe', …)` (invalid signature) was removed. |
| **Business question** | Completed newsletter conversions by placement. |
| **Key event** | **Yes (recommended)** |

### `outbound_source_clicked`

| Field | Value |
|--------|--------|
| **Fires** | Clicks on Binance / Airtm referral or P2P links: `BrandButton` (`BinanceButton`, `AirtmButton`), `Header`, `MobileMenu`, and Binance P2P secondary CTA on `BuyDollars`. |
| **Files** | `frontend/src/components/BrandButton.jsx`, `frontend/src/components/Header.jsx`, `frontend/src/components/MobileMenu.jsx`, `frontend/src/pages/BuyDollars.jsx` |
| **Parameters** | `language`, `destination` (full URL), `link_label` (placement id, e.g. `header_binance`, `binance_referral`), `page_path` |
| **Business question** | Which placements drive affiliate / partner outbound clicks? |

---

## Implementation files (quick reference)

| Area | File |
|------|------|
| Core `gtag` + debug | `frontend/src/utils/analytics.js` |
| Product event API | `frontend/src/utils/analyticsEvents.js` |

---

## Maintenance

- Prefer **one** canonical event name per user action; avoid adding parallel events for the same gesture.
- When adding parameters, keep names **snake_case** to match GA4 custom dimension mapping.
- Register new custom dimensions in GA4 if you need them in **Explore** reports (optional, after events appear in realtime).
