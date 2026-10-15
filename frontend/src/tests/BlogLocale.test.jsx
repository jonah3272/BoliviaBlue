import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '../contexts/LanguageContext';
import Blog from '../pages/Blog';
import { articlesEs, articlesEn } from '../data/blogArticles';
import { BLOG_TRANSLATIONS, blogLocalePaths } from '../utils/blogLocale';
import { fetchBlogArticleBySlug, fetchBlogArticles } from '../utils/blogApi';

vi.mock('../utils/blogApi', () => ({ fetchBlogArticleBySlug: vi.fn(), fetchBlogArticles: vi.fn() }));
vi.mock('../utils/analyticsEvents', () => ({ trackLanguageSwitched: vi.fn() }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReadyWhen: vi.fn() }));
vi.mock('../components/Header', async () => {
  const { default: LanguageToggle } = await import('../components/LanguageToggle');
  return { default: () => <LanguageToggle /> };
});
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => null }));
vi.mock('../components/SocialShare', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../components/DailyEvidenceArchive', () => ({ default: () => null }));

const articles = { es: articlesEs, en: articlesEn };
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
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
async function checkArticle(pair, language) {
  const article = articles[language].find(item => item.slug === pair[language]);
  await screen.findByRole('heading', { level: 1, name: article.title });
  await waitFor(() => expect(canonical()).toBe('https://www.boliviablue.com' + blogLocalePaths(article.slug)[language]));
  expect(document.documentElement.lang).toBe(language);
  for (const [locale, path] of Object.entries({ ...blogLocalePaths(article.slug), 'x-default': blogLocalePaths(article.slug).es })) {
    expect(document.head.querySelector(`link[hreflang="${locale}"]`)?.getAttribute('href')).toBe('https://www.boliviablue.com' + path);
  }
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
}

beforeEach(() => {
  localStorage.clear();
  fetchBlogArticles.mockResolvedValue([]);
  fetchBlogArticleBySlug.mockResolvedValue(null); // Published local fallback.
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('published bilingual blog navigation', () => {
  for (const pair of BLOG_TRANSLATIONS) for (const language of ['es', 'en']) {
    it(`${pair[language]} loads directly despite a conflicting stored preference and query`, async () => {
      localStorage.setItem('language', language === 'en' ? 'es' : 'en');
      const router = mount(`/blog/${pair[language]}?lang=${language === 'en' ? 'es' : 'en'}&utm_source=review#sources`);
      await checkArticle(pair, language);
      expect(fetchBlogArticleBySlug).toHaveBeenLastCalledWith(pair[language], language);
      // MemoryRouter's parent listener misses the provider's initial layout-effect
      // replace. URL normalization is covered directly in tests/blog-locale.test.js.
      expect(new URLSearchParams(router.state.location.search).get('utm_source')).toBe('review');
      expect(router.state.location.hash).toBe('#sources');
    });
  }

  it('resolves a percent-encoded English slug consistently with the initial HTML', async () => {
    mount('/blog/%77hat-is-usdt-tether-complete-guide');
    await checkArticle(BLOG_TRANSLATIONS[1], 'en');
  });

  it('toggles both ways repeatedly and restores translated slugs, query and head on Back/Forward', async () => {
    const pair = BLOG_TRANSLATIONS[1];
    const router = mount(`/blog/${pair.es}?utm_source=review#sources`);
    await checkArticle(pair, 'es');
    for (const language of ['en', 'es', 'en']) {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
      await checkArticle(pair, language);
      expect(router.state.location.pathname).toBe(`/blog/${pair[language]}`);
      expect(router.state.location.search).toContain('utm_source=review');
      expect(router.state.location.hash).toBe('#sources');
    }
    await act(async () => router.navigate(-1)); await checkArticle(pair, 'es');
    await act(async () => router.navigate(1)); await checkArticle(pair, 'en');
    await act(async () => router.navigate(`/blog/${BLOG_TRANSLATIONS[0].es}`));
    await checkArticle(BLOG_TRANSLATIONS[0], 'es'); // Explicit Spanish link wins over the English session.
  });

  it('ignores an older language response after navigating to its translated partner', async () => {
    const pair = BLOG_TRANSLATIONS[0];
    let resolveOld;
    fetchBlogArticleBySlug.mockImplementation((slug) => slug === pair.es ? new Promise(resolve => { resolveOld = resolve; }) : Promise.resolve(null));
    mount(`/blog/${pair.es}`);
    await waitFor(() => expect(resolveOld).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
    await checkArticle(pair, 'en');
    await act(async () => resolveOld(articlesEs.find(item => item.slug === pair.es)));
    await checkArticle(pair, 'en');
  });

  it('keeps unknown slugs missing and noindexed without translation alternates', async () => {
    mount('/blog/unknown-guide?lang=en');
    await screen.findByRole('heading', { level: 1, name: 'Article not found' });
    expect(document.head.querySelector('meta[name="robots"]').content).toBe('noindex, nofollow');
    expect(document.head.querySelectorAll('link[hreflang]')).toHaveLength(0);
    expect(document.querySelector('.blog-content')).toBeNull();
  });
});
