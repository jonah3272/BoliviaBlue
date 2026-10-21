import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import BlueRateCards from '../components/BlueRateCards';
import RateTrioStrip from '../components/RateTrioStrip';
import { MemoryRouter } from 'react-router-dom';

const m = vi.hoisted(() => ({ currency: 'USD', language: 'en', t: key => key, blue: vi.fn(), card: vi.fn() }));
vi.mock('../utils/api', () => ({ fetchBlueRate: m.blue, fetchCardRates: m.card }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: m.language, t: m.t }) }));
vi.mock('../contexts/CurrencyContext', () => ({ useCurrency: () => ({ currency: m.currency }) }));
vi.mock('../components/PageHead', () => ({ default: ({ children }) => children }));
vi.mock('../components/CrossSourceBadge', () => ({ default: () => null }));
vi.mock('../utils/analytics', () => ({ trackRateCardView: vi.fn(), trackOfficialRateToggle: vi.fn(), trackRateUpdate: vi.fn() }));

const pairs = { USD: [11.8, 12], BRL: [2.1, 2.2], EUR: [13, 13.14], COP: [.002, .003], PEN: [3.2, 3.3], ARS: [.008, .009], CLP: [.011, .012] };
const quote = currency => ({ currency, buy: pairs[currency][0], sell: pairs[currency][1], updated_at_iso: '2026-10-12T18:45:00Z' });
const cards = { visa_bob_per_usd: 11.77, t: '2026-10-12T18:45:00Z', source: 'wise' };
const start = () => act(async () => vi.advanceTimersByTimeAsync(100));
const openCard = () => fireEvent.click(screen.getByRole('button', { name: m.language === 'es' ? 'Mostrar tasa de tarjeta US' : 'Show US card exchange rate' }));
const comparison = () => screen.queryByText(/cardRateVsBlue/);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-12T18:50:00Z'));
  vi.clearAllMocks();
  m.currency = 'USD'; m.language = 'en';
  m.blue.mockImplementation(async currency => quote(currency));
  m.card.mockResolvedValue(cards);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

for (const language of ['es', 'en']) for (const currency of Object.keys(pairs)) {
  it(`${language} ${currency}: compares matching USD units only, preserving the card quote and fee calculation`, async () => {
    m.language = language; m.currency = currency;
    render(<BlueRateCards />);
    await start();
    openCard();
    expect(screen.getByText('11.77')).toBeInTheDocument();
    if (currency === 'USD') {
      expect(comparison()).toBeInTheDocument();
      expect(screen.getByText(/-1.09%/)).toBeInTheDocument();
    } else {
      expect(comparison()).not.toBeInTheDocument();
      expect(screen.queryByText(/cardRateBetter|cardRateWorse/)).not.toBeInTheDocument();
      expect(screen.getByText(language === 'es' ? /Seleccioná USD para comparar/ : /Select USD to compare/)).toBeInTheDocument();
      expect(screen.queryByText(/above the P2P midpoint|below the P2P midpoint|encima del punto medio P2P|debajo del punto medio P2P/)).not.toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('option', { name: '3% FX' }));
    expect(screen.getByText('11.43')).toBeInTheDocument();
    if (currency !== 'USD') expect(comparison()).not.toBeInTheDocument();
  });
}

it('hides the comparison immediately on currency change and restores it only after matching USD data returns', async () => {
  let resolveEur, resolveUsd;
  m.blue.mockResolvedValueOnce(quote('USD'))
    .mockImplementationOnce(() => new Promise(resolve => { resolveEur = resolve; }))
    .mockImplementationOnce(() => new Promise(resolve => { resolveUsd = resolve; }));
  const { rerender } = render(<BlueRateCards />);
  await start(); openCard();
  expect(comparison()).toBeInTheDocument();
  m.currency = 'EUR'; rerender(<BlueRateCards />);
  expect(comparison()).not.toBeInTheDocument();
  await start();
  expect(screen.getByText('11.77')).toBeInTheDocument();
  expect(comparison()).not.toBeInTheDocument();
  await act(async () => resolveEur(quote('EUR')));
  expect(comparison()).not.toBeInTheDocument();
  m.currency = 'USD'; rerender(<BlueRateCards />);
  expect(comparison()).not.toBeInTheDocument();
  await start();
  expect(comparison()).not.toBeInTheDocument();
  await act(async () => resolveUsd(quote('USD')));
  expect(comparison()).toBeInTheDocument();
  expect(screen.getByText(/-1.09%/)).toBeInTheDocument();
});

it('waits for the independent card result before showing a USD comparison', async () => {
  let resolveCard;
  m.card.mockImplementation(() => new Promise(resolve => { resolveCard = resolve; }));
  render(<BlueRateCards />);
  await start(); openCard();
  expect(comparison()).not.toBeInTheDocument();
  await act(async () => resolveCard(cards));
  expect(comparison()).toBeInTheDocument();
  expect(screen.getByText(/-1.09%/)).toBeInTheDocument();
});


it('synchronizes fees bidirectionally between top rate controls and daily comparison', async () => {
  render(<MemoryRouter><BlueRateCards /><RateTrioStrip buy={11.8} sell={12} updatedAt={cards.t} cardUpdatedAt={cards.t} cardRate={11.77} language="en" /></MemoryRouter>);
  await start(); openCard();
  fireEvent.click(screen.getByRole('option', { name: '3% FX' }));
  expect(screen.getByRole('combobox')).toHaveValue('3');
  expect(document.querySelector('[data-daily-payment-result]')).toHaveTextContent('4.0%');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '0' } });
  expect(screen.getByRole('option', { name: '0% FX' })).toHaveAttribute('aria-selected', 'true');
  expect(document.querySelector('[data-daily-payment-result]')).toHaveTextContent('1.1%');
});
