# Official BCB provenance correction

This correction replaces external/synthetic and numeric-only official fallbacks with one BCB-only policy shared by the GitHub Actions backend and Vercel backup/self-heal collectors. P2P aggregation and its `source_observation` contract are unchanged.

## Storage and reader contract

A separate nullable `rates.official_observation` JSONB records version, status, BCB source URL, BCB board date, original retrieval time, and the exact buy/sell/mid used. Existing official REAL columns remain nullable. The single current BCB board value becomes equal buy/sell, with no invented spread. Duplicate REAL values are checked against the JSON evidence within float32 storage tolerance.

- Successful dated BCB board: actual published value and original source/retrieval dates.
- Failed BCB request: only a validated previously recorded BCB observation may be reused. It is explicitly stale, with its original time and values. No external API is called.
- No verified prior observation: official numbers are null/unavailable, while P2P collection continues.
- Legacy or malformed official evidence: current readers return null/unverified. Plausible/equal numeric values and P2P provenance never establish a BCB source.
- Reader-time freshness marks official evidence stale after six hours or when its board date precedes the current Bolivia date. A new P2P timestamp cannot renew it. Status therefore reflects freshness at read time, not just the collection-time status.

Current API, direct-Supabase frontend, caches, cards, comparisons, calculators and historical charts use the same evidence. Official values remain USD/BOB even when another currency is selected. Missing official chart points become gaps, never P2P substitutions. Historical official charts intentionally omit legacy unverified values.

Historical JSON retains all original numeric fields and qualifies them with `official_observation`, `official_status`, `official_source`, `official_source_date` and `official_observed_at`. Existing seven-column CSV is retained for consumer compatibility; it contains raw archived fields and cannot establish official provenance. Both export servers send `X-Official-Provenance: legacy-values-unverified; per-row-status-in-json`. Use JSON for per-row provenance. No historical row is updated or backfilled.

Provenance is application-recorded evidence, not a cryptographic guarantee. Existing database insert permissions are outside this change; there are no RLS, grant, credential or other security edits.

## Release order

1. Confirm production main still matches the reviewed base or re-review intervening changes.
2. Apply `docs/official-provenance-schema.sql` to the verified BoliviaBlue database. This adds only nullable `official_observation jsonb`, without defaults, constraints, indexes, backfill or permission changes. A short lock timeout aborts rather than waiting indefinitely.
3. Query `information_schema.columns` to verify JSONB, nullable, no default; verify existing numeric field nullability unchanged. Verify PostgREST can select the field before deploying readers/writers.
4. Release both collectors/readers together. Old writers remain structurally compatible after the additive column but their evidence-free rows display as unverified in new readers; avoid a long mixed-version window.
5. Verify a newly collected row: exact BCB numeric values match the current primary dated board; JSON original retrieval time differs independently from P2P time; P2P provenance unchanged. Verify public API, JSON export, CSV header, bilingual cards and a non-USD selection.
6. Confirm the two known October 3 raw synthetic rows remain unchanged and now receive unverified JSON qualification. Do not use this release to correct historical data.

During deployment the latest legacy row may briefly display official unavailable until a new collector observation is saved. If BCB is down and no verified observation exists yet, unavailable is the intended safe result.

## Rollback

Retain the nullable column and any new evidence; dropping it would destroy recorded provenance. Older code can still insert rows without the column. Prefer fixing forward or rolling back UI-only changes while retaining the BCB-only resolver and source-aware readers. Rolling all code back to the old release would reintroduce the known synthetic fallback and must not be presented as a safe containment strategy.

## Verification and limits

Local regression coverage includes primary success, timeout/HTTP/empty/malformed/ambiguous HTML, exact class/attribute boundaries, original date preservation, memory/stored stale fallback, legacy rejection, both collectors, null midpoint, storage/API/export, UI labels and gaps, self-heal, non-USD views and P2P independence. The saved October 16 primary BCB HTML parses to 11.68/11.68 with date 2026-10-16.

Actual production metadata was inspected read-only before implementation: all official numeric fields are nullable REAL, source_observation is nullable JSONB, official_observation was absent, and no check constraints or noninternal triggers block the proposed nulls. A disposable PostgreSQL fixture was initialized locally, but the sandbox denied Unix socket creation; runtime DDL fixture assertions could not run. No alternate transport or bypass was attempted. The reviewed SQL is one additive ALTER TABLE inside a transaction; deployment must verify actual schema state afterward.

Baseline limitations: the broad Node suite has an existing press-kit middleware assertion failure. The full frontend suite has seven failing files and three failing tests from existing legacy RateCards expectations and mixed Node/Playwright collection. The correction must introduce no new failures; targeted official regressions and the production build must pass.
