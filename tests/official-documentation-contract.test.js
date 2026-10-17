import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getDataDocumentationPage } from '../frontend/src/data/dataDocumentation.js';
import { getSourceCompositionExample } from '../frontend/src/data/sourceCompositionExample.js';
import { getApiDocumentation } from '../frontend/src/data/apiDocumentation.js';

const require = createRequire(import.meta.url);
const { officialPayload } = require('../shared/officialProvenance.cjs');
const { exportOptions, fetchHistoricalExport, toCsv } = require('../api/_lib/historicalExport');

for (const language of ['es', 'en']) {
  test(`methodology and downloads qualify official provenance (${language})`, () => {
    const source = getDataDocumentationPage('/fuente-de-datos', language);
    const history = getDataDocumentationPage('/datos-historicos', language);
    const explanation = source.copy.officialSeparation;
    for (const field of ['official_observation', 'official_status', 'stale', 'official_source_date', 'official_observed_at', 'official_buy', 'official_sell', 'official_mid', 'null']) assert.ok(explanation.includes(field), field);
    assert.doesNotMatch(explanation, /BCB o fuentes|BCB or sources/);
    for (const page of [source, history]) {
      const warning = page.methodology.coverageDescription;
      for (const field of ['official_*', 'CSV', 'JSON', 'official_observation', 'official_status', 'unverified']) assert.ok(warning.includes(field), field);
    }
    assert.ok(getApiDocumentation(language).copy.historicalProvenance.includes('official_source_date'));
    assert.ok(getApiDocumentation(language).copy.historicalProvenance.includes('official_observed_at'));
    assert.ok(getApiDocumentation(language).copy.historicalProvenance.includes('stale'));
  });
}

test('CSV documentation includes the official-provenance header emitted by the handler', () => {
  const handler = readFileSync(new URL('../api/historical-data.js', import.meta.url), 'utf8');
  const match = handler.match(/'X-Official-Provenance': '([^']+)'/);
  assert.ok(match);
  for (const language of ['es', 'en']) {
    const csv = getApiDocumentation(language).endpoints.find(({ path }) => path.endsWith('.csv'));
    assert.ok(csv.response.includes(`X-Official-Provenance: ${match[1]}`));
  }
});

test('current values are withheld while historical numeric values remain explicitly unverified', async () => {
  const legacy = { t: '2026-10-03T12:00:00Z', buy: 12.34, sell: 12.56, mid: 12.45, official_buy: 12.08, official_sell: 11.98, official_mid: 12.03 };
  const current = officialPayload(legacy);
  assert.equal(current.official_status, 'unverified');
  for (const key of ['official_buy', 'official_sell', 'official_mid']) assert.equal(current[key], null);
  const query = { select() { return this; }, lte() { return this; }, gte() { return this; }, order() { return this; }, range() { return this; }, then(resolve) { return Promise.resolve({ data: [legacy] }).then(resolve); } };
  const result = await fetchHistoricalExport({ from: () => query }, exportOptions({}, new Date(legacy.t)));
  const point = result.points[0];
  for (const key of ['official_buy', 'official_sell', 'official_mid']) assert.equal(point[key], legacy[key]);
  assert.equal(point.official_status, 'unverified');
  assert.equal(point.official_observation.source, null);
  assert.equal(result.metadata.official_provenance, 'per_row_in_json; legacy_values_unverified');
  assert.equal(toCsv([point]), 't,buy,sell,mid,official_buy,official_sell,official_mid\n2026-10-03T12:00:00Z,12.34,12.56,12.45,12.08,11.98,12.03\n');
});

test('a stale official reading retains BCB provenance and original timestamps', () => {
  const observation = { version: 1, status: 'verified', source: 'bcb', source_url: 'https://www.bcb.gob.bo/', source_date: '2026-10-16', observed_at: '2026-10-16T21:00:00Z', buy: 11.68, sell: 11.68, mid: 11.68 };
  const result = officialPayload({ t: '2026-10-17T15:00:00Z', official_buy: 11.68, official_sell: 11.68, official_mid: 11.68, official_observation: observation }, { now: Date.parse('2026-10-17T15:00:00Z') });
  assert.equal(result.official_status, 'stale');
  assert.equal(result.official_source, 'bcb');
  assert.equal(result.official_observed_at, observation.observed_at);
  assert.equal(result.official_source_date, observation.source_date);
  assert.equal(result.official_mid, 11.68);
});

test('preserved source-composition download is qualified without rewriting its raw evidence', () => {
  const points = JSON.parse(readFileSync(new URL('../frontend/public/data/examples/2026-10-08-source-composition.json', import.meta.url), 'utf8'));
  assert.equal(points.length, 2);
  for (const point of points) {
    assert.equal(officialPayload(point).official_status, 'unverified');
    assert.equal(point.source_provenance, 'persisted_observation');
  }
  for (const language of ['es', 'en']) {
    const { evidence } = getSourceCompositionExample(language);
    for (const field of ['official_*', 'official_observation', 'BCB', 'P2P']) assert.ok(evidence.includes(field), field);
  }
});
