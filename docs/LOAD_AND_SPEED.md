# Load reliability and speed (mobile + Supabase free tier)

## Is it “perfect”?

**No** – we can’t guarantee 100% for every user. We fixed the **most likely** causes of “keeps loading” on mobile:

1. **Service worker** – Null `Accept` header on some requests could crash the SW and break loading. Fixed with a safe check.
2. **Reload loop** – Unregistering the SW then calling `location.reload()` made the page reload on every visit; on slow mobile that looked like infinite loading. We now only unregister, no reload.
3. **Hanging requests** – Rate and history had no timeout, so bad networks could spin forever. We added 18s (rate) and 25s (history) timeouts so users see an error instead.

Other things can still cause issues: strict firewalls, old browsers, DNS, ad blockers, or flaky networks. If problems continue, ask affected users to try another network or browser and to do a full refresh (or clear site data once).

---

## Load speed on Supabase free tier

The free tier can feel slower (cold starts, fewer resources). We added:

### In-memory cache (already in code)

- **Rate:** 90-second cache per currency. The first call hits Supabase; any other call in the next 90s (e.g. Home + BlueRateCards, or a quick refresh) reuses the same result. Cuts duplicate rate calls and helps when Supabase is slow.
- **History:** 60-second cache per range+currency. Switching chart range (e.g. 1D → 1W → 1D) reuses the last result for 60s so toggles feel instant.

### Optional improvements (if it’s still slow)

1. **Supabase region** – In the dashboard, pick a region closest to most users (e.g. South America if most traffic is from Bolivia).
2. **Reduce initial chart load** – The chart currently fetches both “ALL” (for data age) and the selected range in parallel. You could fetch only the selected range first so the chart paints faster, then fetch “ALL” in the background for the data-age label.
3. **Server-side cache** – If you add a small backend (e.g. Vercel serverless or Railway), cache the latest rate for 30–60s and serve it from there so the client doesn’t hit Supabase on every page load.

---

## Summary

- **Reliability:** We fixed the main mobile/loading bugs; edge cases (network, browser, firewall) can still happen.
- **Speed:** 90s rate cache and 60s history cache reduce Supabase calls and make repeat loads and chart toggles faster on the free tier.
