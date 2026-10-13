import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Comparison from '../pages/Comparison';

const mocks = vi.hoisted(() => ({
  language: 'es', rate: vi.fn(), history: vi.fn(), related: vi.fn(), meta: vi.fn(),
}));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: mocks.language, t: key => key }) }));
vi.mock('../utils/api', () => ({ fetchBlueRate: mocks.rate, fetchBlueHistory: mocks.history }));
vi.mock('../utils/analyticsEvents', () => ({ trackComparisonPageViewed: vi.fn(), trackRelatedLinkClicked: mocks.related }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/PageMeta', () => ({ default: props => { mocks.meta(props); return null; } }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: () => null }));
vi.mock('../components/BinanceBanner', () => ({ default: () => null }));

const observedAt = '2026-10-13T12:00:00Z';
const rate = { buy: 12.02, sell: 11.98, official_buy: 6.86, official_sell: 6.96, updated_at_iso: observedAt };
const observation = platforms => ({
  version: 1, observed_at: observedAt, method: 'median_of_platform_quotes',
  quote_asset: 'USDT', fiat: 'BOB', platforms,
});
const sources = {
  unknown: null,
  single: observation([{ id: 'binance', buy: 12.02, sell: 11.98 }]),
  multiple: observation([{ id: 'binance', buy: 12.01, sell: 11.97 }, { id: 'eldorado', buy: 12.03, sell: 11.99 }]),
  mismatched: { ...observation([{ id: 'bybit', buy: 12.02, sell: 11.98 }]), observed_at: '2026-10-12T12:00:00Z' },
};
function Location() {
  const location = useLocation();
  return <output aria-label="Current location">{location.pathname + location.search}</output>;
}
const mount = () => render(<MemoryRouter><Comparison /><Location /></MemoryRouter>);
const metrics = () => screen.getByRole('region', { name: mocks.language === 'es' ? 'Cotización actual: blue vs valor referencial (BCB)' : 'Current quote: blue vs reference rate (BCB)' });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rate.mockResolvedValue(rate);
  mocks.history.mockResolvedValue({ points: [rate] });
});
afterEach(cleanup);

for (const language of ['es', 'en']) describe(`Comparison source copy (${language})`, () => {
  beforeEach(() => { mocks.language = language; });

  for (const [name, source_observation] of Object.entries(sources)) it(`keeps neutral attribution for ${name} source metadata without changing quotes or midpoint calculations`, async () => {
    mocks.rate.mockResolvedValue({ ...rate, source_observation });
    mount();
    const section = within(metrics());
    expect(await section.findByText('12.02 / 11.98 BOB/USDT')).toBeInTheDocument();
    expect(section.getByText('6.86 / 6.96 BOB/USD')).toBeInTheDocument();
    expect(section.getByText('+5.09 BOB')).toBeInTheDocument();
    expect(section.getByText('+73.7%')).toBeInTheDocument();
    expect(section.getByText(language === 'es' ? /Promedio de la última semana: 5.09 BOB \(\+73.7%\)/ : /Last 7 days average: 5.09 BOB \(\+73.7%\)/)).toBeInTheDocument();
    expect(section.getByText(language === 'es' ? /Fuente: referencia P2P agregada/ : /Source: aggregated P2P reference/)).toBeInTheDocument();
    expect(screen.getByText(language === 'es' ? 'Referencia P2P agregada' : 'Aggregated P2P reference')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Binance P2P|El Dorado|Bybit|OKX|thousands of actual transactions|miles de transacciones reales/);
    expect(screen.getByText(language === 'es' ? /incluir una sola fuente/ : /including just one source/)).toBeInTheDocument();
    expect(screen.getByText(language === 'es' ? /Solo el desglose guardado y coincidente/ : /Only a stored breakdown matching/)).toBeInTheDocument();
    expect(mocks.rate).toHaveBeenCalledTimes(1);
    expect(mocks.history).toHaveBeenCalledWith('1W');
  });

  it('explains customer and institution directions, fee limits and cash-dollar differences in visible copy and FAQ', async () => {
    mount();
    const section = within(metrics());
    await section.findByText('12.02 / 11.98 BOB/USDT');
    expect(section.getByText(language === 'es' ? 'Referencia P2P (compras / vendes USDT)' : 'P2P reference (you buy / sell USDT)')).toBeInTheDocument();
    expect(section.getByText(language === 'es' ? 'BCB (la entidad compra / vende USD)' : 'BCB (the institution buys / sells USD)')).toBeInTheDocument();
    const explanation = section.getByText(language === 'es' ? /compra = BOB que pagas por 1 USDT; venta = BOB que recibes por 1 USDT/ : /buy = BOB you pay for 1 USDT; sell = BOB you receive for 1 USDT/);
    expect(explanation).toHaveTextContent(language === 'es' ? 'antes de comisiones' : 'before fees');
    expect(explanation).toHaveTextContent(language === 'es' ? 'USDT no es USD en efectivo' : 'USDT is not cash USD');
    expect(explanation).toHaveTextContent(language === 'es' ? 'no representan la misma dirección para el cliente' : 'do not represent the same customer direction');
    const faq = mocks.meta.mock.lastCall[0].structuredData.find(schema => schema['@type'] === 'FAQPage');
    const answer = faq.mainEntity[1].acceptedAnswer.text;
    expect(screen.getByText(answer)).toBeInTheDocument();
    expect(answer).toContain(language === 'es' ? 'No es una cotización garantizada de dólares en efectivo' : 'It is not a guaranteed cash-dollar quote');
  });

  it('offers a focusable, descriptively named methodology link with the correct locale and existing analytics contract', async () => {
    mount();
    await within(metrics()).findByText('12.02 / 11.98 BOB/USDT');
    const link = within(metrics()).getByRole('link', { name: language === 'es' ? 'Metodología P2P' : 'P2P methodology' });
    const target = language === 'es' ? '/fuente-de-datos' : '/fuente-de-datos?lang=en';
    expect(link).toHaveAttribute('href', target);
    expect(link).toHaveClass('underline');
    link.focus();
    expect(link).toHaveFocus();
    fireEvent.click(link);
    expect(screen.getByLabelText('Current location')).toHaveTextContent(target);
    expect(mocks.related).toHaveBeenCalledTimes(1);
    expect(mocks.related).toHaveBeenCalledWith({ language, destination: '/fuente-de-datos', link_label: 'quote_methodology', page_type: 'comparison' });
  });

  it('keeps neutral copy and direction explanations while loading, then displays the unchanged result', async () => {
    let resolveRate;
    mocks.rate.mockImplementation(() => new Promise(resolve => { resolveRate = resolve; }));
    mocks.history.mockResolvedValue({ points: [] });
    mount();
    const section = within(metrics());
    expect(section.getAllByText('—')).toHaveLength(4);
    expect(section.getByRole('link', { name: language === 'es' ? 'Metodología P2P' : 'P2P methodology' })).toBeInTheDocument();
    expect(section.getByText(language === 'es' ? /compra = BOB que pagas/ : /buy = BOB you pay/)).toBeInTheDocument();
    await act(async () => resolveRate(rate));
    expect(section.getByText('12.02 / 11.98 BOB/USDT')).toBeInTheDocument();
  });
});
