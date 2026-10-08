# Homepage clarity and search-intent experiment

Baseline: main `9316541904a6cdb40bffcb38d962a19917c132cb`.

## Scope

- Homepage ES/EN title and description become stable, intent-specific text; live buy/sell and observation time remain in the visible answer and rate display.
- Both responsive homepage headings and initial HTML identify the blue-dollar query intent.
- The normalized payload retains raw same-record source inputs for validation. The homepage answer names only recognized stored contributions whose timestamp and median match the record. Missing/invalid metadata stays unavailable; old observations retain their observation time and stale warning.
- The source panel, newsroom text report, and new homepage source strings use seven-significant-digit normalization before two-decimal formatting, solely to remove float-storage display noise. Raw quotes, snapshot JSON, rate calculation, storage and API contracts are unchanged.
- Public source IDs require string type and an own-key match; malformed JSON IDs cannot become contributor names or throw during rendering.
- Euro routes, other dollar-route copy, canonical/redirect ownership, financial calculations and security settings are outside this change.

## Evaluation

This is a reversible search-copy experiment, not a ranking guarantee. Google may rewrite snippets and take time to recrawl. Compare consistent query, page, country, device, and comparable date cohorts after indexing; also inspect impressions, position and page/query mix before attributing a change to this copy.

## Verification

- `node --test *.test.js tests/*.test.* frontend/scripts/*.test.cjs`
- `node --test api/*.test.js api/_lib/*.test.* backend/tests/*.test.js`
- From frontend: `npx vitest run src/tests/HomeSearchAnswer.test.jsx src/tests/SourceObservationPanel.test.jsx`
- From frontend: `BUILD_RATE_BUY=11.905 BUILD_RATE_SELL=11.915 npm run build`

The build fixture deliberately has no observation timestamp: it must not invent one from build time. Runtime tests exercise stored/unknown/invalid/stale observations, both languages, initial middleware HTML and React answer rendering. Rounding tests retain original JSON values.

Broad frontend Vitest still has existing RateCards failures and collects non-Vitest Node/Playwright suites; this change does not fix that unrelated harness. Browser and mobile visual QA remain unverified and should be checked on the deployment preview.

## Rollback

Revert the single bundled change (or revert its merge commit with the correct mainline parent) to restore the baseline. No data migration or stored-rate rollback is needed.
