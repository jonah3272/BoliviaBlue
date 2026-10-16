import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage, translations } from '../contexts/LanguageContext';
import About from '../pages/About';
import { ABOUT_COPY, getAboutPage } from '../data/aboutPage.js';
import { renderAboutHtml } from '../../../seo/aboutSeo.js';

vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: ({ subtitle }) => <header>{subtitle}</header> }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: () => null }));
const template = '<!doctype html><html lang="es"><head><title>Old title</title></head><body><div id="root"></div></body></html>';
const compact = (text) => text.replace(/\s+/g, ' ').trim();
const articleText = (element) => compact([...element.querySelectorAll('h1,h2,h3,p,li')].map(n => n.textContent).join(' '));
function mount(path) {
  window.history.replaceState({}, '', path);
  const router = {};
  function Probe() {
    router.navigate = useNavigate();
    const { toggleLanguage } = useLanguage();
    return <><button onClick={toggleLanguage}>Switch language</button><About /></>;
  }
  render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Probe /></LanguageProvider></MemoryRouter>);
  return router;
}
function verify(language) {
  const page = getAboutPage(language);
  const initial = new DOMParser().parseFromString(renderAboutHtml(template, `?lang=${language}`), 'text/html');
  expect(articleText(document.querySelector('article'))).toBe(articleText(initial.querySelector('article')));
  expect(document.querySelector('header')).toHaveTextContent(page.copy.aboutHeaderSubtitle);
  expect(document.title).toBe(page.title);
  expect(document.documentElement.lang).toBe(language);
  for (const selector of ['link[rel="canonical"]', 'meta[name="description"]', 'meta[name="keywords"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:url"]', 'link[hreflang="es"]', 'link[hreflang="en"]', 'link[hreflang="x-default"]']) {
    expect(document.head.querySelectorAll(selector)).toHaveLength(1);
    const attr = selector.startsWith('link') ? 'href' : 'content';
    expect(document.head.querySelector(selector).getAttribute(attr)).toBe(initial.head.querySelector(selector).getAttribute(attr));
  }
  const schemas = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent));
  expect(schemas.find(s => s['@type'] === 'BreadcrumbList')).toEqual(page.breadcrumbSchema);
  expect(document.body.textContent).not.toMatch(/about[A-Z]\w+|cada (?:15|5) minutos|every (?:15|5) minutes|every few minutes|cada pocos minutos|típicamente fija|typically fixed|very infrequently/);
  for (const [key, value] of Object.entries(ABOUT_COPY[language])) expect(translations[language][key]).toBe(value);
  for (const platform of ['Binance', 'El Dorado', 'OKX', 'Bybit']) expect(document.querySelector('article')).toHaveTextContent(platform);
}
afterEach(() => { cleanup(); window.history.replaceState({}, '', '/'); localStorage.clear(); });
for (const language of ['es', 'en']) describe(`About credibility (${language})`, () => {
  it('renders complete translated article and metadata matching the initial HTML', () => {
    localStorage.setItem('language', language === 'es' ? 'en' : 'es');
    mount(`/acerca-de${language === 'en' ? '?lang=en' : ''}`);
    verify(language);
  });
});
it('keeps corrected content and one metadata identity through switching and Back/Forward', async () => {
  const router = mount('/acerca-de'); verify('es');
  fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
  await waitFor(() => verify('en'));
  await act(async () => router.navigate(-1)); verify('es');
  await act(async () => router.navigate(1)); verify('en');
  fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
  await waitFor(() => verify('es'));
});
