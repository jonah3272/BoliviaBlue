import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import PressKit from '../pages/PressKit';

const state = vi.hoisted(() => ({ language: 'es' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: state.language }) }));
vi.mock('../contexts/RateContext', () => ({ useRate: () => ({ rateData: null, isLoading: false, error: null }) }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/NewsroomSnapshot', () => ({ default: () => null }));
vi.mock('../components/CiteShareBar', () => ({ default: () => null }));

const BASE = 'https://www.boliviablue.com';
function mount(path) {
  window.history.replaceState({}, '', path);
  const router = {};
  function Probe() { router.navigate = useNavigate(); return <PressKit />; }
  render(<MemoryRouter initialEntries={[path]}><Probe /></MemoryRouter>);
  return router;
}
function checkHead(before = null) {
  const es = before ? `/prensa?before=${before}` : '/prensa';
  const en = es + (before ? '&' : '?') + 'lang=en';
  const canonical = BASE + (state.language === 'en' ? en : es);
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.head.querySelector('link[rel="canonical"]').href).toBe(canonical);
  for (const [locale, path] of [['es', es], ['en', en], ['x-default', es]]) {
    expect(document.head.querySelector(`link[hreflang="${locale}"]`).href).toBe(BASE + path);
  }
  expect(document.head.querySelector('meta[property="og:url"]').content).toBe(canonical);
  expect(document.head.querySelector('meta[name="twitter:url"]').content).toBe(canonical);
  expect(document.head.querySelector('meta[name="robots"]').content).toBe('index, follow');
  const schemas = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  expect(JSON.stringify(schemas)).toContain(JSON.stringify(canonical));
}
async function checkArchive(before = null) {
  const endpoint = '/api/daily-report?view=archive' + (before ? `&before=${before}` : '');
  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(endpoint, expect.anything()));
  const paths = [...document.querySelectorAll('#informes-diarios a')].map(link => link.getAttribute('href'));
  expect(paths).toHaveLength(before === '2026-10-10' ? 1 : before === '2026-10-13' ? 4 : 5);
  if (before) expect(paths.every(path => path.match(/\/informes\/(\d{4}-\d{2}-\d{2})\//)?.[1] < before)).toBe(true);
}
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reports: [], unavailable: false, next_before: null }) }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });

for (const language of ['es', 'en']) describe(`archive metadata after React commits (${language})`, () => {
  beforeEach(() => { state.language = language; });
  it('retains the validated cursor in canonical, alternates and page identity', async () => {
    mount(`/prensa?lang=${language}&before=2026-10-13&utm_source=review#informes-diarios`);
    checkHead('2026-10-13');
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/daily-report?view=archive&before=2026-10-13', expect.anything()));
  });
  it('leaves the first-page identity unchanged', async () => {
    mount(`/prensa?lang=${language}`);
    checkHead();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/daily-report?view=archive', expect.anything()));
  });
  it('uses first-page metadata and data for an invalid cursor', async () => {
    mount(`/prensa?before=2026-02-30&lang=${language}`);
    checkHead();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/daily-report?view=archive', expect.anything()));
  });
  it('updates metadata on older-page navigation and Back/Forward without duplication', async () => {
    const router = mount(`/prensa?before=2026-10-13&lang=${language}`);
    checkHead('2026-10-13'); await checkArchive('2026-10-13');
    await act(async () => router.navigate(`/prensa?before=2026-10-10&lang=${language}`));
    checkHead('2026-10-10'); await checkArchive('2026-10-10');
    await act(async () => router.navigate(-1)); checkHead('2026-10-13'); await checkArchive('2026-10-13');
    await act(async () => router.navigate(1)); checkHead('2026-10-10'); await checkArchive('2026-10-10');
    await act(async () => router.navigate(`/prensa?lang=${language}`)); checkHead(); await checkArchive();
  });
});
