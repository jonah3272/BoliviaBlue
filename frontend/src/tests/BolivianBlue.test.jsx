import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BolivianBlue from '../pages/BolivianBlue';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy';
import { fetchBlueRate } from '../utils/api';
import { renderDollarRateHtml } from '../../../seo/dollarRateSeo';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd } = require('../../scripts/inject-seo-shell.cjs');
const template = readFileSync('index.html', 'utf8');
const sourceHtml = () => injectStaticJsonLd(injectRootShell(replaceMeta(template, '/bolivian-blue'), ROUTES['/bolivian-blue'].shell), '/bolivian-blue');
const context = vi.hoisted(() => ({ language: 'es', t: (key) => key }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => context }));
vi.mock('../utils/api', () => ({ fetchBlueRate: vi.fn(), fetchCardRates: vi.fn().mockResolvedValue(null) }));
vi.mock('../contexts/CurrencyContext', () => ({ useCurrency: () => ({ currency: 'USD' }) }));
vi.mock('../utils/analytics', () => ({ trackRateCardView: vi.fn(), trackOfficialRateToggle: vi.fn(), trackRateUpdate: vi.fn() }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BlueChart', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => <a href="https://www.binance.com/">Binance banner retained</a> }));
vi.mock('../components/PrimaryRateLink', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
beforeEach(() => vi.clearAllMocks());
afterEach(() => { cleanup(); document.head.innerHTML = ''; });

function assertHead(model, language) {
  expect(document.title).toBe(model.title);
  for (const name of ['description', 'og:description', 'twitter:description']) {
    const tags = document.head.querySelectorAll(`meta[name="${name}"], meta[property="${name}"]`);
    expect(tags).toHaveLength(1);
    expect(tags[0].content).toBe(model.description);
  }
  for (const name of ['og:title', 'twitter:title']) expect(document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`).content).toBe(model.title);
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.head.querySelector('link[rel="canonical"]').href).toBe(`https://www.boliviablue.com/bolivian-blue${language === 'en' ? '?lang=en' : ''}`);
  expect(document.documentElement.lang).toBe(language);
  const schema = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  expect(JSON.stringify(schema)).not.toMatch(/cada ~?15|every ~?15|verified|verificad|millions|millones|1,060/);
  const page = schema.find(item => item['@type'] === 'WebPage');
  expect(page.dateModified ?? null).toBe(model.observedAt);
}
for (const language of ['es', 'en']) describe(`Bolivian Blue (${language})`, () => {
  for (const state of ['fresh', 'stale', 'aged', 'missing-time', 'invalid-time', 'stale-missing-time', 'stale-invalid-time', 'unavailable', 'zero']) it(`${state}: initial HTML and mounted page share honest locale copy`, async () => {
    context.language = language;
    const input = state === 'unavailable' ? null : {
      buy_bob_per_usd: state === 'zero' ? 0 : 12.345, sell_bob_per_usd: 12.675,
      updated_at_iso: state.endsWith('missing-time') ? null : state.endsWith('invalid-time') ? 'invalid' : state === 'aged' ? '2020-01-01T12:00:00Z' : new Date().toISOString(),
      is_stale: state.startsWith('stale'),
    };
    const normalized = normalizeDollarRatePayload(input);
    const model = buildLiveRateSeoMeta({ ...normalized, page: 'bolivian-blue', language });
    // The shared renderer changes route copy only; language/canonical annotations belong to middleware.
    let initial = renderDollarRateHtml(sourceHtml(), '/bolivian-blue', normalized, language);
    if (language === 'en') initial = initial.replace('<html lang="es"', '<html lang="en"').replace('rel="canonical" href="https://www.boliviablue.com/bolivian-blue"', 'rel="canonical" href="https://www.boliviablue.com/bolivian-blue?lang=en"');
    document.head.innerHTML = initial.match(/<head>([\s\S]*?)<\/head>/)[1];
    document.documentElement.lang = language;
    assertHead(model, language);
    fetchBlueRate.mockResolvedValue(input);
    const { container } = render(<MemoryRouter initialEntries={[`/bolivian-blue${language === 'en' ? '?lang=en' : ''}`]}><BolivianBlue /></MemoryRouter>);
    await waitFor(() => expect(document.title).toBe(model.title));
    await waitFor(() => expect(screen.getAllByText(model.answer)).toHaveLength(3));
    await waitFor(() => expect(container.querySelector('.skeleton')).toBeNull());
    assertHead(model, language);
    expect(document.head.querySelector('script[type="application/ld+json"]')?.textContent).not.toContain('ExchangeRateSpecification');
    expect([...document.head.querySelectorAll('script[type="application/ld+json"]')].some(node => JSON.parse(node.textContent)['@type'] === 'ExchangeRateSpecification')).toBe(false);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(language === 'es' ? 'Bolivian Blue – Tipo de Cambio Dólar Blue Bolivia' : 'Bolivian Blue – Bolivia Blue Dollar Exchange Rate');
    expect(container.textContent).not.toMatch(/cada 15|every 15|millions|millones|1,060|10-20%|verified|verificad/);
    expect(container.textContent).toContain(model.observation);
    expect(container.textContent).toMatch(language === 'es' ? /composición de fuentes.*no está confirmada/ : /source composition.*not confirmed/);
    for (const href of ['/calculadora', '/dolar-blue-hoy', '/datos-historicos', '/fuente-de-datos', '/acerca-de']) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Binance banner retained' })).toBeTruthy();
  });
});
