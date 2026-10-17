import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RETROSPECTIVE_RELEASES } from '../frontend/src/data/retrospectiveReleases.js';
import { reviewedRetrospective, reviewedRetrospectiveIds, retrospectiveRevisionLabel, isDiscoverableBlogArticle } from '../frontend/src/data/reviewedRetrospectives.js';
import { legacyDailyNotice } from '../frontend/src/data/legacyDailyNotice.js';
import { loadArticle, renderArticleHtml } from '../seo/articleSeo.js';

const template = '<html lang="es"><head></head><body><div id="root"></div><script src="/app.js"></script></body></html>';
const now = Date.now();
const revision = new Date(now - 60_000).toISOString();
const rowFor = (release) => ({ ...release.fields, updated_at: revision });
const initialStates = RETROSPECTIVE_RELEASES.map((release) => release.state);
const pending = RETROSPECTIVE_RELEASES.map((release) => ({ ...release, state: 'pending-approval' }));
const reviewed = RETROSPECTIVE_RELEASES.map((release) => ({ ...release, state: 'reviewed' }));
async function withReviewed(callback) {
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'reviewed'; });
  try { return await callback(); } finally { RETROSPECTIVE_RELEASES.forEach((release, index) => { release.state = initialStates[index]; }); }
}
const schema = (html) => JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1]);

for (const release of RETROSPECTIVE_RELEASES) {
  test(`${release.observationDate} ${release.language}: pending candidate cannot publish itself or whitelist the old slug`, () => {
    assert.equal(reviewedRetrospective(rowFor(release), { releases: pending }), null);
    assert.deepEqual(reviewedRetrospectiveIds(release.language, pending), []);
  });
  test(`${release.observationDate} ${release.language}: exact reviewed live row carries actual revision and no draft/duplicate h1`, () => {
    const result = reviewedRetrospective(rowFor(release), { releases: reviewed, now });
    assert.equal(result.revisedAt, revision);
    assert.equal(result.fields.published_at, `${release.observationDate} 04:00:00+00`);
    assert.match(retrospectiveRevisionLabel(result, release.language), /Bolivia, UTC−4/);
    assert.doesNotMatch(result.fields.content, /<h1>|Borrador pendiente|Publication is pending/);
    assert.match(result.fields.content, /source|procedencia/i);
  });
  test(`${release.observationDate} ${release.language}: every payload/identity field and release timestamp is guarded`, () => {
    for (const key of Object.keys(release.fields)) {
      const row = rowFor(release);
      row[key] = typeof row[key] === 'boolean' ? !row[key] : `${row[key]}changed`;
      assert.equal(reviewedRetrospective(row, { releases: reviewed, now }), null, key);
    }
    for (const updated_at of [undefined, '', 'bad', release.fields.created_at, '2026-04-28T04:00:00Z', new Date(now + 1).toISOString()]) {
      assert.equal(reviewedRetrospective({ ...rowFor(release), updated_at }, { releases: reviewed, now }), null, String(updated_at));
    }
    const microsecondChange = { ...rowFor(release), created_at: release.fields.created_at.replace(/\.\d+/, '.999999') };
    assert.equal(reviewedRetrospective(microsecondChange, { releases: reviewed, now }), null);
    const sameMillisecondChange = { ...rowFor(release), created_at: release.fields.created_at.replace(/(\.\d{3})\d*/, '$1999') };
    assert.equal(reviewedRetrospective(sameMillisecondChange, { releases: reviewed, now }), null);
    assert.equal(reviewedRetrospective(rowFor(release), { releases: reviewed.map((item) => ({ ...item, preparedAt: 'invalid' })), now }), null);
    const formatted = { ...rowFor(release), created_at: release.fields.created_at.replace(' ', 'T').replace('+00', 'Z'), published_at: release.fields.published_at.replace(' ', 'T').replace('+00', 'Z') };
    assert.ok(reviewedRetrospective(formatted, { releases: reviewed, now }), 'PostgREST timestamp serialization stays equivalent');
  });
  test(`${release.observationDate} ${release.language}: initial HTML and client notice use corrected body, dated download and actual dateModified only`, async () => withReviewed(async () => {
    const row = rowFor(release);
    const request = { kind: 'blog', slug: release.slug, language: release.language };
    const article = await loadArticle(request, { env: { SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'test-only' }, fetcher: async (url) => {
      assert.ok(url.searchParams.get('select').includes('content'));
      return { ok: true, json: async () => [row] };
    } });
    const html = renderArticleHtml(template, article, request);
    const expected = `https://www.boliviablue.com/blog/${release.slug}${release.language === 'en' ? '?lang=en' : ''}`;
    assert.equal(article.canonical, expected);
    assert.equal(schema(html).dateModified, revision);
    assert.equal(schema(html).datePublished, undefined);
    assert.equal(schema(html).url, expected);
    assert.equal(schema(html).headline, release.fields.title);
    assert.equal(schema(html).description, release.fields.excerpt);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.match(html, /data-reviewed-retrospective/);
    assert.match(html, /hreflang="en" href="[^" ]*\?lang=en"/);
    assert.ok(html.includes(release.fields.content));
    assert.ok(html.includes(release.evidencePath));
    assert.ok(html.includes(retrospectiveRevisionLabel(article.retrospective, release.language)));
    assert.doesNotMatch(html, /original article remains|Conservamos el artículo original|Borrador pendiente|Publication is pending/);
    assert.equal(legacyDailyNotice(release.slug, release.language, row).title, release.notice.title);
    assert.match(html, /src="\/app.js"/);
  }));
  test(`${release.observationDate} ${release.language}: deploying reviewed code before the DB leaves original report behavior and discovery excluded`, async () => withReviewed(async () => {
    const original = { ...rowFor(release), title: 'Original report', content: '<p>Original body</p>', updated_at: release.fields.created_at };
    assert.equal(isDiscoverableBlogArticle(original), false);
    const request = { kind: 'blog', slug: release.slug, language: release.language };
    const article = await loadArticle(request, { env: { SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'test' }, fetcher: async () => ({ ok: true, json: async () => [original] }) });
    const html = renderArticleHtml(template, article, request);
    assert.equal(schema(html).dateModified, undefined);
    assert.equal(schema(html).datePublished, release.fields.published_at);
    assert.doesNotMatch(html, /data-reviewed-retrospective|observations-and-calculations.zip/);
    assert.match(html, release.language === 'en' ? /original article remains/ : /Conservamos el artículo original/);
  }));
  test(`${release.observationDate} ${release.language}: missing DB row and outage never fall back to an unpublished prepared retrospective`, async () => {
    const request = { kind: 'blog', slug: release.slug, language: release.language };
    for (const [status, fetcher] of [[404, async () => ({ ok: true, json: async () => [] })], [503, async () => { throw new Error('offline'); }]]) {
      const result = await loadArticle(request, { env: { SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'test' }, fetcher });
      assert.equal(result.status, status);
      const html = renderArticleHtml(template, result, request);
      assert.doesNotMatch(html, /data-reviewed-retrospective|"@type":"BlogPosting"/);
      assert.match(html, /noindex, follow/);
    }
  });
}

test('548 other legacy rows and daily-evidence stay excluded; ordinary guides remain discoverable', async () => withReviewed(async () => {
  const release = RETROSPECTIVE_RELEASES[0];
  for (let index = 0; index < 548; index++) {
    const date = new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10);
    assert.equal(isDiscoverableBlogArticle({ ...rowFor(release), id: `other-${index}`, slug: `analisis-diario-${date}` }), false);
  }
  assert.equal(isDiscoverableBlogArticle({ ...rowFor(release), category: 'daily-evidence' }), false);
  assert.equal(isDiscoverableBlogArticle({ slug: 'ordinary-guide', category: 'Guide' }), true);
  assert.equal(legacyDailyNotice('ordinary-guide'), null);
  assert.match(legacyDailyNotice('analisis-diario-2026-10-13', 'en').body, /original article remains/);
}));

test('reviewed reader support keeps the generic SQL exclusions and does not alter the provenance archive or sitemap', () => {
  for (const path of ['frontend/src/utils/blogApi.js', 'api/rss-blog.js']) {
    const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    assert.match(source, /\.not\('slug', 'like', 'analisis-diario-%'\)/);
    assert.match(source, /\.neq\('category', 'daily-evidence'\)/);
    assert.match(source, /\.in\('id', ids\)/);
  }
  for (const path of ['api/_lib/sitemapXml.js', 'api/_lib/dailyEvidenceStore.js', 'frontend/src/data/blogArticles.js']) {
    assert.doesNotMatch(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), /analisis-diario-2026-04-28/);
  }
});

// Both date pairs are approved, but complete exact live payloads are still required.
test('the registry contains only two approved date pairs and still rejects unchanged bodies', () => {
  assert.equal(RETROSPECTIVE_RELEASES.length, 4);
  assert.deepEqual([...new Set(RETROSPECTIVE_RELEASES.map((item) => item.observationDate))], ['2026-04-28', '2025-12-17']);
  for (const language of ['es', 'en']) {
    const april = RETROSPECTIVE_RELEASES.find((item) => item.observationDate === '2026-04-28' && item.language === language);
    const december = RETROSPECTIVE_RELEASES.find((item) => item.observationDate === '2025-12-17' && item.language === language);
    assert.equal(april.state, 'reviewed');
    assert.equal(december.state, 'reviewed');
    assert.deepEqual(reviewedRetrospectiveIds(language), [april.id, december.id]);
    assert.ok(reviewedRetrospective(rowFor(april)));
    assert.ok(reviewedRetrospective(rowFor(december)));
    const original = { ...rowFor(december), content: 'Original body', updated_at: december.fields.created_at };
    assert.equal(isDiscoverableBlogArticle(original), false);
    assert.match(legacyDailyNotice(december.slug, language, original).body, language === 'en' ? /original article remains/ : /Conservamos el artículo original/);
  }
});
