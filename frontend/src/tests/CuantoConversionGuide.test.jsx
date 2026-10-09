import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import CuantoEstaDolarBolivia from '../pages/CuantoEstaDolarBolivia';
import { getCuantoConversionGuide } from '../data/cuantoConversionGuide';
import { buildLiveRateSeoMeta } from '../utils/seoRateMeta';
import { normalizeDollarRatePayload } from '../utils/dollarRateSearchCopy';
import { fetchBlueRate } from '../utils/api';

const context = vi.hoisted(() => ({ language: 'es' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => context }));
vi.mock('../utils/api', () => ({ fetchBlueRate: vi.fn() }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/PageMeta', () => ({ default: () => null }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: () => null }));
vi.mock('../components/BlueChart', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => null }));
vi.mock('../components/PrimaryRateLink', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}
const renderPage = () => render(<MemoryRouter initialEntries={['/cuanto-esta-dolar-bolivia']}><CuantoEstaDolarBolivia /><Location /></MemoryRouter>);
beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

for (const language of ['es', 'en']) describe(`how-much mounted page (${language})`, () => {
  for (const state of ['fresh', 'stale', 'no-time', 'unavailable']) it(`${state}: keeps honest references and working calculator presets`, async () => {
    context.language = language;
    const input = state === 'unavailable' ? null : {
      buy_bob_per_usd: 12.345, sell_bob_per_usd: 11.975,
      updated_at_iso: state === 'no-time' ? null : new Date().toISOString(),
      is_stale: state === 'stale',
    };
    fetchBlueRate.mockResolvedValue(input);
    const { container } = renderPage();
    const guide = getCuantoConversionGuide(language);
    const model = buildLiveRateSeoMeta({ ...normalizeDollarRatePayload(input), page: 'cuanto', language });
    await waitFor(() => expect(screen.getAllByText(model.answer)).toHaveLength(2));
    expect(screen.getAllByText(guide.explanation)).toHaveLength(2);
    const cards = container.querySelector('[data-cuanto-reference-cards]');
    expect(cards).toHaveTextContent(guide.buyLabel);
    expect(cards).toHaveTextContent(guide.sellLabel);
    expect(cards.querySelectorAll('div.text-xs')).toHaveLength(2);
    for (const unit of cards.querySelectorAll('div.text-xs')) expect(unit).toHaveTextContent(guide.unit);
    if (input) {
      expect(cards).toHaveTextContent(model.buyStr);
      expect(cards).toHaveTextContent(model.sellStr);
    } else expect(cards.textContent.match(/—/g)).toHaveLength(2);
    if (state === 'stale') expect(container.textContent).toMatch(/desactualizada|stale/);
    if (state === 'no-time') expect(container.textContent).toMatch(/Hora de lectura no disponible|Observation time unavailable/);
    if (state === 'unavailable') expect(container.textContent).toMatch(/Lectura P2P no disponible|P2P reading unavailable/);
    expect(container.textContent).not.toMatch(/1234\.50|12345\.00|cada 15|every 15|precio real al que|real price at which/);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const preset of guide.presets) {
      const link = screen.getByRole('link', { name: preset.label });
      expect(link).toHaveAttribute('href', preset.href);
      fireEvent.click(link);
      expect(screen.getByTestId('location')).toHaveTextContent(preset.href);
    }
  });
});
