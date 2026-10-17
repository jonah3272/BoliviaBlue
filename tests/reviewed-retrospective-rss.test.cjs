const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
let rows = [], ordinary = [], secondaryThrows = false, secondaryError = false, requests = [];
const previousLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === '@supabase/supabase-js') return { createClient: () => ({ from(table) {
    const request = { table, operations: [], exact: false };
    requests.push(request);
    const query = {};
    for (const method of ['select', 'eq', 'neq', 'not', 'order', 'limit', 'in']) query[method] = (...values) => {
      request.operations.push([method, ...values]);
      if (method === 'in') request.exact = true;
      return query;
    };
    query.then = (resolve, reject) => request.exact && secondaryThrows
      ? Promise.reject(new Error('offline')).then(resolve, reject)
      : Promise.resolve({ data: request.exact ? rows : ordinary, error: request.exact && secondaryError ? { message: 'unavailable' } : null }).then(resolve, reject);
    return query;
  } }) };
  return previousLoad.call(this, name, ...args);
};
const handler = require('../api/rss-blog.js');
Module._load = previousLoad;
async function run() {
  let status, body;
  const res = { status(value) { status = value; return this; }, setHeader() {}, send(value) { body = value; return this; } };
  const originalUrl = process.env.SUPABASE_URL, originalKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://example.test'; process.env.SUPABASE_ANON_KEY = 'test-only';
  try { await handler({ method: 'GET' }, res); } finally {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_ANON_KEY; else process.env.SUPABASE_ANON_KEY = originalKey;
  }
  return { status, body };
}
async function fixture(callback) {
  const { RETROSPECTIVE_RELEASES } = await import('../frontend/src/data/retrospectiveReleases.js');
  const initialStates = RETROSPECTIVE_RELEASES.map((item) => item.state);
  RETROSPECTIVE_RELEASES.forEach((item) => { item.state = 'pending-approval'; });
  const release = RETROSPECTIVE_RELEASES.find((item) => item.language === 'es');
  const revision = new Date(Date.now() - 60_000).toISOString();
  rows = [{ ...release.fields, updated_at: revision }];
  ordinary = [{ slug: 'ordinary-guide', title: 'Ordinary guide', published_at: '2025-01-01T00:00:00Z' }];
  requests = []; secondaryThrows = false; secondaryError = false;
  try { await callback({ releases: RETROSPECTIVE_RELEASES, release, revision }); }
  finally { RETROSPECTIVE_RELEASES.forEach((item, index) => { item.state = initialStates[index]; }); }
}
test('RSS pending candidate does not get fetched or promoted', () => fixture(async ({ release }) => {
  const result = await run();
  assert.equal(result.status, 200);
  assert.match(result.body, /Ordinary guide/);
  assert.ok(!result.body.includes(release.slug));
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].operations.find((op) => op[0] === 'not'), ['not', 'slug', 'like', 'analisis-diario-%']);
}));
test('RSS exact reviewed payload gets current revision date; all other legacy rows stay excluded', () => fixture(async ({ releases, release, revision }) => {
  releases.forEach((item) => { item.state = 'reviewed'; });
  rows.push({ ...rows[0], content: 'unreviewed change' }, { ...rows[0], id: 'other' });
  ordinary.push({ ...rows[0], slug: 'analisis-diario-2026-04-27', title: 'Excluded legacy' });
  const result = await run();
  assert.equal(result.status, 200);
  assert.equal((result.body.match(/<item>/g) || []).length, 2);
  assert.match(result.body, /https:\/\/www.boliviablue.com\/blog\/analisis-diario-2026-04-28/);
  assert.ok(result.body.includes(new Date(revision).toUTCString()));
  assert.match(result.body, /Retrospectiva revisada/);
  assert.doesNotMatch(result.body, /Excluded legacy|Tue, 28 Apr 2026/);
  assert.deepEqual(requests[1].operations.find((op) => op[0] === 'in'), ['in', 'id', releases.filter((item) => item.language === 'es').map((item) => item.id)]);
}));
for (const outcome of ['throw', 'error', 'mismatched body']) test(`RSS ${outcome} fails closed without hiding ordinary feed`, () => fixture(async ({ releases, release }) => {
  releases.forEach((item) => { item.state = 'reviewed'; });
  secondaryThrows = outcome === 'throw'; secondaryError = outcome === 'error';
  if (outcome === 'mismatched body') rows[0].content = 'old body';
  const result = await run();
  assert.equal(result.status, 200);
  assert.match(result.body, /Ordinary guide/);
  assert.ok(!result.body.includes(release.slug));
}));

test('RSS keeps published April while December stays pending, even if its proposed text is returned', () => fixture(async ({ releases, revision }) => {
  releases.forEach((item) => { item.state = item.observationDate === '2026-04-28' ? 'reviewed' : 'pending-approval'; });
  rows = releases.filter((item) => item.language === 'es').map((item) => ({ ...item.fields, updated_at: revision }));
  const result = await run();
  assert.equal((result.body.match(/<item>/g) || []).length, 2);
  assert.ok(result.body.includes('analisis-diario-2026-04-28'));
  assert.ok(!result.body.includes('analisis-diario-2025-12-17'));
  assert.deepEqual(requests[1].operations.find((op) => op[0] === 'in'), ['in', 'id', [rows[0].id]]);
}));
test('RSS admits only both approved exact Spanish payloads with independent actual revision dates', () => fixture(async ({ releases, revision }) => {
  releases.forEach((item) => { item.state = 'reviewed'; });
  rows = releases.filter((item) => item.language === 'es').map((item, index) => ({ ...item.fields, updated_at: index ? revision : new Date(Date.parse(revision) - 60_000).toISOString() }));
  rows.push({ ...rows[1], content: 'unreviewed' }, { ...rows[1], id: 'other-legacy' });
  const result = await run();
  assert.equal((result.body.match(/<item>/g) || []).length, 3);
  assert.ok(result.body.indexOf('analisis-diario-2025-12-17') < result.body.indexOf('analisis-diario-2026-04-28'));
  assert.ok(result.body.includes(new Date(rows[0].updated_at).toUTCString()));
  assert.ok(result.body.includes(new Date(rows[1].updated_at).toUTCString()));
  assert.doesNotMatch(result.body, /Wed, 17 Dec 2025|Tue, 28 Apr 2026|unreviewed|other-legacy/);
}));
