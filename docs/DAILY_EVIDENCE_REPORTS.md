# Daily evidence reports

This replaces the narrative daily generator. The previous generator's daily percentage changes compared the latest row to itself. Its 548 existing daily article rows are not deleted or rewritten: direct URLs receive a correction notice, while the new archive replaces their collection promotion. Non-daily guides are retained.

## What is published

- `/prensa/informes/YYYY-MM-DD/v1` is the server-rendered, bilingual report (English: `?lang=en`). It works without JavaScript.
- Sibling `datos.json`, `fuentes.csv`, `grafico.svg` and `cita.txt` downloads derive from the same verified payload. SVG is the supported chart download; PNG is deliberately not promised without a reproducible server-side font/rasterization setup.
- The report endpoint is routed through the existing historical-data serverless function, keeping the deployment at its existing free-plan function count.
- `/prensa` and `/blog` expose the archive. `/api/daily-report?view=archive` is date-paginated; `next_before` requests older dates. There is no rolling-30-day storage dependency.
- Five source-backed launch editions cover October 9–13, 2026. October 8 has incomplete provenance; earlier aggregate history cannot establish a fixed source basket. No seven-day/month source-backed history is claimed.
- The edition creation timestamp and source retrieval timestamp are distinct from the observation date. Launch payloads are generated on October 14, not backdated to the observed day.

## Recent-report RSS discovery

`/prensa/informes/rss.xml` is a Spanish RSS 2.0 feed through the existing historical-data function (`feature=daily-evidence&view=feed`). It reads the existing archive storage on request; newly stored eligible reports require no feed rebuild or deployment. Successful responses may be cached by the CDN for up to 300 seconds, with mandatory revalidation and no stale-while-revalidate window. Storage failures return `503` and `Cache-Control: no-store`, never a seed-only success feed.

The window is the latest 30 **observed dates** available for completed Bolivia days, including every distinct revision of those dates. It is not 30 calendar days, publication-date ordering, or a comprehensive correction-alert log: a correction to an older observed date outside the window will not appear. The archive remains the route to older dates. Feed query parameters do not paginate or translate this canonical feed.

Each item is only a discovery pointer: observed date, revision, absolute canonical versioned report URL/GUID, and fixed P2P scope/caveats. It carries no rate values, comparisons or new narrative article. A revision has a distinct GUID; earlier revisions keep theirs. `pubDate` is included only for a valid, non-future stored `published_at` with an explicit timezone. Invalid/unknown timestamps are omitted. Repository-backed seed editions omit `pubDate`: their `generated_at` is not proven publication time, and their stored duplicates cannot override the seed metadata.

The press archive exposes a visible RSS link and an RSS `rel=alternate` discovery link in both its static shell and React view, without changing language alternates. English UI explicitly says the feed is Spanish. The shared React archive also makes the visible feed link available where that component is reused. Existing dated report HTML and all report downloads are deliberately unchanged: adding a discovery tag there would change the published serialization. Existing blog/news feeds remain separate and unchanged.

No serverless entrypoint, schedule, service, account, storage write, report revision or report payload is added by feed reads. This is a bounded metadata index; each linked report endpoint still validates its evidence before serving it, and the archive reader verifies its newest stored edition. It is not independent verification of every indexed payload.

Validation: `node --test tests/daily-report-feed.test.cjs tests/daily-evidence.test.cjs tests/daily-evidence-routes.test.cjs tests/archive-pagination-meta.test.cjs` and `cd frontend && npm test -- --run src/tests/DailyEvidenceArchive.test.jsx src/tests/ArchivePaginationMeta.test.jsx`.

## Calculation and eligibility

`shared/dailyEvidence.cjs` is the deterministic calculator. Date boundaries are 00:00–24:00 America/La_Paz, equivalent to 04:00Z boundaries. Only completed days qualify. Each source snapshot is checked with the shared provenance validator, including timestamp and aggregate consistency. Duplicate timestamps, interpolated rows, missing/invalid provenance and missing required sources are excluded with reasons.

The fixed basket is Binance + El Dorado + Bybit. Extra platforms do not change it. Calculate separate buy/sell platform medians for every eligible observation, their midpoint, then the unweighted median of those observation midpoints for the daily headline. This is not the average of daily side medians. Dispersion is the median of within-observation platform max–min ranges, separately for buy/sell.

Publication requires all 24 hourly bins, eligible first/last readings within 45 minutes of day boundaries, and no eligible gap over 60 minutes. These are editorial thresholds, not statistical assurances. Day-to-day and per-platform changes are absent unless both days qualify. Never infer cash prices, executable prices, liquidity, volume, causal explanations or forecasts.

## Storage and accepted limitation

Reports use existing `blog_articles` storage with category `daily-evidence` and distinct slugs `evidence-p2p-YYYY-MM-DD-vN`. The validated report is gzip-compressed into a bounded HTML comment. The public API parses and re-verifies the hash and all calculations before serving evidence. Generic blog lists, direct-article readers and RSS exclude these storage records.

The application inserts each revision once, reads it back, and never updates/upserts it. A correction must create a new revision with a reason and previous revision hash. Old revision routes remain available. Seed editions also have repository-backed copies.

IMPORTANT: Version preservation is enforced by this publisher and remains dependent on the existing storage permissions. It is not database immutability, tamper resistance or authenticity. SHA-256 detects inconsistent payloads; it does not prove original-publication authenticity if both content and hash are replaced. No policies, grants, tables or credentials are changed by this feature.

Storage is bounded to 500 KB compressed-record text and 8 MB expanded JSON per edition. A real 72-observation day plus comparison evidence is ~97 KB JSON and ~10.6 KB stored text, approximately 3.9 MB per year before row/index overhead. Reports are retained. The actual database was ~47 MiB at review; future storage and egress limits still apply. No paid service or model call is introduced.

## Scheduled publication and recovery

`.github/workflows/generate-daily-articles.yml` is the existing workflow, replaced in place. It runs standard public-repository GitHub-hosted Linux compute, with `contents: read` and the existing Supabase secrets. Actions are commit-pinned, the existing database client is lockfile-pinned, and no cache/artifact retention is added.

The requested schedule is 05:17 UTC (01:17 Bolivia). GitHub can delay or skip scheduled jobs, so this is not an exact publication-time guarantee. Target dates are computed once from actual runtime. A main-branch push that changes the workflow, publisher, calculator or storage adapter also exercises publication immediately; unrelated commits, report data changes and pull requests do not trigger it. Each run checks the last seven completed days, publishes missing eligible editions, and preserves already-published editions. A rejected date fails the run visibly while independent eligible dates may still publish. The public archive shows missing completed-day and refresh-failure notices.

Manual workflow dispatch:

1. Use the **current main revision** of `Publish daily evidence reports`, never rerun an old narrative-generator job.
2. Leave date blank for seven-day catch-up, or enter one completed `YYYY-MM-DD` date for older recovery.
3. Keep `dry_run: true` for validation, then run `dry_run: false` to publish. Publishing is main-only.
4. Rerun the exact date to verify `already-published` and the same hash. The writer never overwrites an existing revision.
5. Inspect the job summary, then verify the public dated HTML, JSON hash, CSV rows and attributed SVG. A green dry run alone is not publication.

For a reviewed correction via the script: set `REPORT_DATE`, `REPORT_REVISION` (previous revision + 1), `CORRECTION_REASON`, and `DRY_RUN=false` in the existing authorized server environment. No credential should be copied into a command or log. The chain is checked before insert. The ordinary daily schedule always targets v1.

The backend's legacy exported function delegates to the same safe publication code for compatibility. It does not generate narrative articles.

## Validation

- `node --test tests/daily-evidence.test.cjs tests/daily-evidence-store.test.cjs`
- `cd frontend && npm test -- --run src/tests/DailyEvidenceArchive.test.jsx`
- `cd frontend && npm run build`

Tests cover real historical fixtures, independent expected medians, date boundaries, missing source/coverage, fourth source, duplicates, counterfeit hashes, corrupt compression, insert-only repetition, multi-revision pagination, serving without JavaScript, downloaded formats, future-date refusal and old-article correction notices. Browser QA must be reported separately from these checks.
