import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '../contexts/LanguageContext';
import Blog from '../pages/Blog';
import { RETROSPECTIVE_RELEASES } from '../data/retrospectiveReleases';
import { retrospectiveRevisionLabel, reviewedRetrospective } from '../data/reviewedRetrospectives';
import { fetchBlogArticleBySlug, fetchBlogArticles } from '../utils/blogApi';

vi.mock('../utils/blogApi', () => ({ fetchBlogArticleBySlug: vi.fn(), fetchBlogArticles: vi.fn() }));
vi.mock('../utils/analyticsEvents', () => ({ trackLanguageSwitched: vi.fn() }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReadyWhen: vi.fn() }));
vi.mock('../components/Header', async () => ({ default: (await import('../components/LanguageToggle')).default }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => null }));
vi.mock('../components/SocialShare', () => ({ default: ({ url }) => <a data-share-url href={url}>Share</a> }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../components/DailyEvidenceArchive', () => ({ default: () => null }));

const initialStates = RETROSPECTIVE_RELEASES.map((release) => release.state);
const revision = new Date(Date.now() - 60_000).toISOString();
for (const observationDate of ['2026-04-28', '2025-12-17']) describe(observationDate, () => {
const releases = RETROSPECTIVE_RELEASES.filter((release) => release.observationDate === observationDate);
const rows = Object.fromEntries(releases.map((release) => [release.language, { ...release.fields, updated_at: revision }]));
function mount(path) {
  const router = { state: {} };
  function Probe() {
    router.state.location = useLocation();
    router.navigate = useNavigate();
    return <HelmetProvider><LanguageProvider><Routes><Route path="/blog/:slug?" element={<Blog />} /></Routes></LanguageProvider></HelmetProvider>;
  }
  render(<React.StrictMode><MemoryRouter initialEntries={[path]}><Probe /></MemoryRouter></React.StrictMode>);
  return router;
}
const schemas = () => [...document.head.querySelectorAll('script[type="application/ld+json"]')].map((tag) => JSON.parse(tag.textContent));
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
async function check(language) {
  const row = rows[language];
  await screen.findByRole('heading', { level: 1, name: row.title });
  await waitFor(() => expect(canonical()).toBe(`https://www.boliviablue.com/blog/${row.slug}${language === 'en' ? '?lang=en' : ''}`));
  const schema = schemas().find((item) => item['@type'] === 'BlogPosting');
  expect(schema.dateModified).toBe(revision);
  expect(schema.datePublished).toBeUndefined();
  expect(schema.inLanguage).toBe(language === 'en' ? 'en-US' : 'es-BO');
  expect(screen.getByRole('note')).toHaveTextContent(releases.find((item) => item.language === language).notice.title);
  expect(screen.getByText(retrospectiveRevisionLabel(reviewedRetrospective(row), language))).toBeVisible();
  expect(document.querySelector('.blog-content').innerHTML).toBe(row.content);
  expect(document.querySelectorAll('h1')).toHaveLength(1);
  expect(document.body).not.toHaveTextContent(/original article remains|Conservamos el artículo original|Borrador pendiente|Publication is pending/);
  expect(document.querySelector('[data-share-url]')).toHaveAttribute('href', canonical());
}

beforeEach(() => {
  localStorage.clear();
  RETROSPECTIVE_RELEASES.forEach((release) => { release.state = 'reviewed'; });
  fetchBlogArticleBySlug.mockImplementation((_slug, language) => Promise.resolve(rows[language]));
  fetchBlogArticles.mockImplementation((language) => Promise.resolve([rows[language]]));
});
afterEach(() => {
  cleanup(); vi.clearAllMocks();
  RETROSPECTIVE_RELEASES.forEach((release, index) => { release.state = initialStates[index]; });
});

for (const language of ['es', 'en']) {
  it(`${language}: direct article metadata, body, evidence and revision agree`, async () => {
    localStorage.setItem('language', language === 'es' ? 'en' : 'es');
    mount(`/blog/${rows[language].slug}${language === 'en' ? '?lang=en' : ''}`);
    await check(language);
    const evidence = screen.getByRole('link', { name: language === 'en' ? 'Download the dated observations and calculations' : 'Descargar las observaciones y los cálculos de estas fechas' });
    expect(evidence).toHaveAttribute('href', releases[0].evidencePath);
  });
  it(`${language}: collection retains review payload, uses revision metadata and preserves locale in its link`, async () => {
    mount(`/blog${language === 'en' ? '?lang=en' : ''}`);
    const heading = await screen.findByRole('heading', { name: rows[language].title });
    expect(heading.closest('a')).toHaveAttribute('href', `/blog/${rows[language].slug}${language === 'en' ? '?lang=en' : ''}`);
    await waitFor(() => expect(schemas().find((item) => item['@type'] === 'CollectionPage')?.mainEntity.itemListElement).toHaveLength(1));
    const article = schemas().find((item) => item['@type'] === 'CollectionPage').mainEntity.itemListElement[0].item;
    expect(article.dateModified).toBe(revision);
    expect(article.datePublished).toBeUndefined();
    expect(screen.getByText(retrospectiveRevisionLabel(reviewedRetrospective(rows[language]), language))).toBeVisible();
    fireEvent.click(heading.closest('a'));
    await check(language);
  });
}

it('repeated language switches and Back/Forward retain the same slug with the correct locale', async () => {
  const router = mount(`/blog/${rows.es.slug}?utm_source=test#sources`);
  await check('es');
  for (const language of ['en', 'es', 'en']) {
    fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
    await check(language);
    expect(router.state.location.pathname).toBe(`/blog/${rows.es.slug}`);
    expect(router.state.location.search).toContain('utm_source=test');
    expect(router.state.location.hash).toBe('#sources');
  }
  await act(async () => router.navigate(-1)); await check('es');
  await act(async () => router.navigate(1)); await check('en');
});

it('an older language response cannot restore the wrong body, notice or revision', async () => {
  let resolveOld;
  fetchBlogArticleBySlug.mockImplementation((_slug, language) => language === 'es' ? new Promise((resolve) => { resolveOld = resolve; }) : Promise.resolve(rows.en));
  mount(`/blog/${rows.es.slug}`);
  await waitFor(() => expect(resolveOld).toBeTypeOf('function'));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
  await check('en');
  await act(async () => resolveOld(rows.es));
  await check('en');
});

it('reviewed support on an unchanged legacy row does not activate the replacement notice or dateModified', async () => {
  const original = { ...rows.en, title: 'Original article', content: '<p>Original article body</p>', updated_at: rows.en.created_at };
  fetchBlogArticleBySlug.mockResolvedValue(original);
  fetchBlogArticles.mockResolvedValue([]);
  mount(`/blog/${rows.en.slug}?lang=en`);
  await screen.findByRole('heading', { level: 1, name: 'Original article' });
  await waitFor(() => expect(schemas().find((item) => item['@type'] === 'BlogPosting')).toBeTruthy());
  const schema = schemas().find((item) => item['@type'] === 'BlogPosting');
  expect(schema.dateModified).toBeUndefined();
  expect(schema.datePublished).toBe(original.published_at);
  expect(screen.getByRole('note')).toHaveTextContent('original article remains');
  expect(screen.queryByRole('link', { name: 'Download the dated observations and calculations' })).toBeNull();
});

it('a missing remote row never falls back to prepared article text', async () => {
  fetchBlogArticleBySlug.mockResolvedValue(null);
  fetchBlogArticles.mockResolvedValue([]);
  mount(`/blog/${rows.en.slug}?lang=en`);
  await screen.findByRole('heading', { level: 1, name: 'Article not found' });
  expect(document.querySelector('.blog-content')).toBeNull();
  expect(document.body).not.toHaveTextContent(rows.en.title);
});

});
