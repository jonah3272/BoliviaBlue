import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { RETROSPECTIVE_RELEASES } from '../data/retrospectiveReleases';
import { fetchBlogArticles, fetchFeaturedBlogArticles } from '../utils/blogApi';
const state = vi.hoisted(() => ({ rows: [], ordinary: [], requests: [], reviewedError: false }));
vi.mock('../utils/supabase', () => ({ supabase: { from(table) {
  const request = { table, ops: [], exact: false };
  state.requests.push(request);
  const query = {};
  for (const method of ['select', 'eq', 'neq', 'not', 'order', 'limit', 'in']) query[method] = (...args) => {
    request.ops.push([method, ...args]);
    if (method === 'in') request.exact = true;
    return query;
  };
  query.then = (resolve) => Promise.resolve({ data: request.exact ? state.rows : state.ordinary, error: request.exact && state.reviewedError ? new Error('unavailable') : null }).then(resolve);
  return query;
} } }));
const initialStates = RETROSPECTIVE_RELEASES.map((release) => release.state);
const revision = new Date(Date.now() - 60_000).toISOString();
const row = (language = 'es') => ({ ...RETROSPECTIVE_RELEASES.find((item) => item.language === language).fields, updated_at: revision });
beforeEach(() => { state.requests = []; state.rows = []; state.ordinary = [{ id: 'guide', slug: 'ordinary-guide', title: 'Guide', category: 'Guide', published_at: '2025-01-01T00:00:00Z' }]; state.reviewedError = false; });
afterEach(() => RETROSPECTIVE_RELEASES.forEach((release, index) => { release.state = initialStates[index]; }));
it('pending descriptors do not query or list legacy exceptions', async () => {
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'pending-approval'; });
  expect(await fetchBlogArticles()).toEqual(state.ordinary);
  expect(state.requests).toHaveLength(1);
  expect(state.requests[0].ops).toContainEqual(['not', 'slug', 'like', 'analisis-diario-%']);
});
for (const language of ['es', 'en']) it(`${language}: queries only reviewed exact IDs, checks payload and sorts by actual revision`, async () => {
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'reviewed'; });
  const exact = row(language);
  state.rows = [exact, { ...exact, id: 'unrelated' }, { ...exact, content: 'old' }, { ...exact, language: language === 'en' ? 'es' : 'en' }];
  state.ordinary.push({ ...exact, id: 'other-unreviewed', slug: 'analisis-diario-2026-04-27' });
  const result = await fetchBlogArticles(language);
  expect(result.map((item) => item.id)).toEqual([exact.id, 'guide']);
  expect(result[0].content).toBe(exact.content);
  expect(state.requests[1].ops).toContainEqual(['in', 'id', RETROSPECTIVE_RELEASES.filter((item) => item.language === language).map((item) => item.id)]);
  expect(state.requests[1].ops).toContainEqual(['eq', 'language', language]);
  expect(state.requests[1].ops).toContainEqual(['neq', 'category', 'daily-evidence']);
});
it('an unavailable exact query leaves normal guides available and no false retrospective', async () => {
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'reviewed'; });
  state.rows = [row()]; state.reviewedError = true;
  expect(await fetchBlogArticles()).toEqual(state.ordinary);
});
it('the preserved featured=false field cannot be overridden to newly feature this article', async () => {
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'reviewed'; });
  state.rows = [row(), { ...row(), featured: true }];
  expect(await fetchFeaturedBlogArticles('es')).toEqual(state.ordinary);
});

for (const language of ['es', 'en']) {
  it(`${language}: pending December cannot be fetched or listed beside published April`, async () => {
    RETROSPECTIVE_RELEASES.filter((item) => item.observationDate === '2025-12-17').forEach((item) => { item.state = 'pending-approval'; });
    state.rows = RETROSPECTIVE_RELEASES.filter((item) => item.language === language).map((item) => ({ ...item.fields, updated_at: revision }));
    const april = state.rows.find((item) => item.slug === 'analisis-diario-2026-04-28');
    expect((await fetchBlogArticles(language)).map((item) => item.id)).toEqual([april.id, 'guide']);
    expect(state.requests[1].ops).toContainEqual(['in', 'id', [april.id]]);
  });
  it(`${language}: two approved exact dates appear independently, ordered by actual revision`, async () => {
    RETROSPECTIVE_RELEASES.forEach((item) => { item.state = 'reviewed'; });
    const releases = RETROSPECTIVE_RELEASES.filter((item) => item.language === language);
    const april = { ...releases[0].fields, updated_at: new Date(Date.parse(revision) - 60_000).toISOString() };
    const december = { ...releases[1].fields, updated_at: revision };
    state.rows = [april, december, { ...december, id: 'unapproved-legacy' }, { ...december, content: 'unreviewed' }];
    expect((await fetchBlogArticles(language)).map((item) => item.id)).toEqual([december.id, april.id, 'guide']);
    expect(state.requests[1].ops).toContainEqual(['in', 'id', [april.id, december.id]]);
    state.rows[1] = { ...december, updated_at: december.created_at };
    expect((await fetchBlogArticles(language)).map((item) => item.id)).toEqual([april.id, 'guide']);
  });
}
