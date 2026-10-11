import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RealToBoliviano from '../pages/RealToBoliviano';
import { getRealConversionPage } from '../data/realConversionPage';
import { fetchBlueRate } from '../utils/api';
const context = vi.hoisted(() => ({ language: 'es' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => context }));
vi.mock('../utils/api', () => ({ fetchBlueRate: vi.fn() }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/PageMeta', () => ({ default: ({ structuredData }) => <script data-testid="page-schema" type="application/ld+json">{JSON.stringify(structuredData)}</script> }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
let refresh;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(globalThis, 'setInterval').mockImplementation((fn, ms, ...args) => { if (ms === 15 * 60 * 1000) { refresh = fn; return 123; } return originalSetInterval(fn, ms, ...args); });
  vi.spyOn(globalThis, 'clearInterval').mockImplementation(id => { if (id !== 123) originalClearInterval(id); });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const quote = () => ({ buy_bob_per_brl: 2.34567, sell_bob_per_brl: 2.32123, updated_at_iso: new Date().toISOString() });
const renderPage = () => render(<MemoryRouter><RealToBoliviano /></MemoryRouter>);

for (const language of ['es', 'en']) describe(`BRL mounted page (${language})`, () => {
  for (const state of ['fresh', 'stale', 'missing', 'invalid', 'no-time', 'error']) it(`${state} has useful, honest shared content`, async () => {
    context.language = language;
    const rate = state === 'error' ? null : { ...quote(), ...(state === 'stale' ? { is_stale: true } : {}), ...(state === 'missing' ? { buy_bob_per_brl: null, sell_bob_per_brl: null } : {}), ...(state === 'invalid' ? { sell_bob_per_brl: -1 } : {}), ...(state === 'no-time' ? { updated_at_iso: null } : {}) };
    if (state === 'error') fetchBlueRate.mockRejectedValue(new Error('offline'));
    else fetchBlueRate.mockResolvedValue(rate);
    const page = getRealConversionPage(language, rate);
    const { container } = renderPage();
    await waitFor(() => expect(screen.getByText(page.status)).toBeInTheDocument());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const section of page.sections) for (const paragraph of section.paragraphs) expect(screen.getByText(paragraph)).toBeInTheDocument();
    expect(screen.getByText(page.timestampNote)).toBeInTheDocument();
    const amounts = container.querySelector('[data-real-amounts]');
    if (state === 'fresh' || state === 'stale') {
      expect(container).toHaveTextContent('2.346 BOB');
      expect(amounts).toHaveTextContent('234.57');
      expect(amounts).toHaveTextContent('232.12');
    } else {
      expect(amounts).not.toHaveTextContent('234.57');
      expect(amounts.textContent.match(/—/g)).toHaveLength(10);
    }
    const schema = JSON.parse(screen.getByTestId('page-schema').textContent);
    expect(schema[1].mainEntity.map(q => q.acceptedAnswer.text)).toEqual(page.faqs.map(f => f.answer));
    expect(container.textContent).not.toMatch(/2\.10|210\.00|cada 15 minutos|every 15 minutes|la más utilizada y segura/);
    expect(screen.getByRole('link', { name: page.links[0].label })).toHaveAttribute('href', '/calculadora' + (language === 'en' ? '?lang=en' : ''));
  });
});
it('replaces the old cross with unavailable when the latest record is explicitly missing BRL', async () => {
  context.language = 'en';
  fetchBlueRate.mockResolvedValueOnce(quote());
  const { container } = renderPage();
  await waitFor(() => expect(container).toHaveTextContent('2.346 BOB'));
  fetchBlueRate.mockResolvedValueOnce({ ...quote(), buy_bob_per_brl: null, sell_bob_per_brl: null });
  await act(() => refresh());
  expect(container).not.toHaveTextContent('2.346 BOB');
  expect(container).toHaveTextContent('BRL/BOB reference unavailable');
});
it('marks the dated record stale after refresh failure, then recovers', async () => {
  context.language = 'en';
  fetchBlueRate.mockResolvedValueOnce(quote());
  const { container } = renderPage();
  await waitFor(() => expect(container).toHaveTextContent('2.346 BOB'));
  fetchBlueRate.mockRejectedValueOnce(new Error('offline'));
  await act(() => refresh());
  expect(container).toHaveTextContent('Stale record');
  expect(container).toHaveTextContent('could not be refreshed');
  fetchBlueRate.mockResolvedValueOnce(quote());
  await act(() => refresh());
  expect(container).not.toHaveTextContent('Stale record');
  expect(container).not.toHaveTextContent('could not be refreshed');
});
it('unmount clears polling and ignores a late response', async () => {
  let resolve;
  fetchBlueRate.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const { unmount } = renderPage();
  unmount();
  expect(clearInterval).toHaveBeenCalledWith(123);
  await act(async () => resolve(quote()));
});
