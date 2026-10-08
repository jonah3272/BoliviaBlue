# Source observation foundation (review only)

## Scope and contract
`rates.source_observation` is nullable JSONB. Version 1 contains `version`, `observed_at`, `method: median_of_platform_quotes`, `quote_asset: USDT`, `fiat: BOB`, and `platforms: [{id, buy, sell}]`.

Both Supabase writers save the collector's per-platform values in the same INSERT as the aggregate rate. `observed_at` matches that row's `t`. This is collection time, not an individual venue timestamp. The values are platform quotes/book medians already used by the existing calculation, not raw advertisements, executed trades, guarantees, or independently revalidated exchange semantics. No parser or rate calculation changes are included. No merchant/account data is retained. Missing/failed venues are not inferred.

API readers validate the version, units, method, timestamp by instant (so Postgres timezone formatting is safe), unique recognized platform IDs, positive finite quotes, and agreement between quote medians and stored aggregate values (one float32 epsilon relative allowance for documented PostgreSQL REAL storage rounding). Invalid/missing data exposes `source_observation: null`, no source list, and `source_provenance: unavailable_for_stored_row`. Valid persisted rows expose `persisted_observation`. Process restarts and different instances do not lose provenance. Never fill historical rows from today's source list.

Historical JSON carries these fields per row and coverage counts in metadata. Existing CSV columns are unchanged; source detail is only in JSON (`csv_provenance: not_included_use_json`). Existing interpolation exclusion and paging/limits remain unchanged. Frontend direct Supabase reads must validate this same contract and render unknown historical records honestly.

## Migration/deployment plan (not executed)
1. Review SQL `supabase_migrations/add_rate_source_observation.sql`, test on a nonproduction database, and approve production migration separately.
2. Apply the nullable column migration BEFORE publishing new readers/writers. Do not run a data backfill. No new table, RLS policy, permission, or credential is needed.
3. Confirm PostgREST's schema cache exposes the column and existing anon reads/service inserts retain their current permissions. If needed, use the normal approved schema reload procedure.
4. Deploy both API/serverless and backend scheduler code together. Old writers during rollout can still produce null provenance; this is deliberately visible as unavailable.
5. Run one authorized refresh from each writer. Read each exact row through a new API process and direct Supabase client. Confirm source quotes reproduce its aggregate, `observed_at` matches `t`, and an older null row is still unavailable. No actual production refresh or migration was run while preparing this patch.
6. Verify historical JSON mixed coverage, unchanged CSV columns, UI unknown/recorded/single-source states, and rate staleness independent of provenance.

## Failure / rollback
A missing column causes writes/new historical selects to fail visibly; we intentionally do not silently drop provenance and call persistence successful. `/api/blue-rate` can still serve an existing row if self-heal fails. Resolve deployment order rather than discarding metadata. Roll back code while retaining the nullable column and its recorded snapshots. Dropping the column destroys useful data and is unnecessary.

## Limits
Snapshots are append-only by application INSERT behavior, not cryptographically signed or database-immutable; existing privileged database access can still edit rows. Raw responses, per-venue observation times, payment-method/size filters, request errors, and individual ad counts are outside this foundation. Read/parse behavior is inherited, not audited or changed. Historical records predating rollout cannot truthfully recover missing composition. SQL execution, live writes, production deployment, and browser QA are separate approval/verification steps.

The repository Dockerfile flattens backend files and already omits their existing api/_lib dependency. The new shared module also requires repository-relative packaging. This patch targets existing Vercel/GitHub Actions/Nixpacks paths; do not use the Dockerfile without separately fixing and verifying that packaging.

Repository-supported execution route: Supabase project dashboard → SQL Editor (`SUPABASE_SETUP.md`). No migration runner/CLI configuration or connected admin SQL tool was verified in this preparation environment. Review actual column types before applying. Dashboard access is not established by the application anon/service API configuration. Local read-only mode does not label skipped inserts as persisted.
