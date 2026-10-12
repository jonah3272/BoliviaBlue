import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BlueRateCards from '../components/BlueRateCards';

const mocks = vi.hoisted(() => ({
  currency: 'USD',
  fetchBlueRate: vi.fn(),
  fetchCardRates: vi.fn(),
  trackRateUpdate: vi.fn(),
  t: (key) => key,
}));
vi.mock('../utils/api', () => ({ fetchBlueRate: mocks.fetchBlueRate, fetchCardRates: mocks.fetchCardRates }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en', t: mocks.t }) }));
vi.mock('../contexts/CurrencyContext', () => ({ useCurrency: () => ({ currency: mocks.currency }) }));
vi.mock('../components/PageHead', () => ({ default: ({ children }) => children }));
vi.mock('../components/CrossSourceBadge', () => ({ default: () => null }));
vi.mock('../utils/analytics', () => ({ trackRateCardView: vi.fn(), trackOfficialRateToggle: vi.fn(), trackRateUpdate: mocks.trackRateUpdate }));

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const quote = (buy = 11.85, sell = 12.05) => ({
  buy, sell, buy_bob_per_usd: buy, sell_bob_per_usd: sell,
  official_buy: 6.86, official_sell: 6.96, updated_at_iso: '2026-10-12T16:30:00Z',
});
const card = (rate = 7.2) => ({ visa_bob_per_usd: rate, t: '2026-10-12T16:30:00Z', source: 'wise' });
const startRequest = () => act(async () => { await vi.advanceTimersByTimeAsync(100); });
const settle = (fn) => act(async () => { fn(); });
const showCards = () => fireEvent.click(screen.getByRole('button', { name: 'Show US card exchange rate' }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-12T16:40:00Z'));
  vi.clearAllMocks();
  mocks.currency = 'USD';
  mocks.fetchBlueRate.mockImplementation(() => new Promise(() => {}));
  mocks.fetchCardRates.mockImplementation(() => new Promise(() => {}));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('independent P2P and card loading', () => {
  it('renders P2P quotes while card service remains pending, and shows a separate card loading state', async () => {
    const blue = deferred(), cards = deferred();
    mocks.fetchBlueRate.mockReturnValue(blue.promise);
    mocks.fetchCardRates.mockReturnValue(cards.promise);
    const { container } = render(<BlueRateCards />);
    await startRequest();
    await settle(() => blue.resolve(quote()));
    expect(screen.getByText('11.85')).toBeInTheDocument();
    expect(screen.getByText('12.05')).toBeInTheDocument();
    showCards();
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
    expect(screen.queryByText('cardRateUnavailable')).not.toBeInTheDocument();
    await settle(() => cards.resolve(card()));
    expect(screen.getByText('7.20')).toBeInTheDocument();
    expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
  });

  it('renders card rates while the P2P service remains pending', async () => {
    mocks.fetchCardRates.mockResolvedValue(card());
    render(<BlueRateCards />);
    await startRequest();
    showCards();
    expect(screen.getByText('7.20')).toBeInTheDocument();
    expect(screen.queryByText('cardRateVsBlue')).not.toBeInTheDocument();
  });

  it('keeps valid P2P quotes when card lookup fails and exposes the card error only in its tab', async () => {
    mocks.fetchBlueRate.mockResolvedValue(quote());
    mocks.fetchCardRates.mockRejectedValue(new Error('Card service unavailable'));
    render(<BlueRateCards />);
    await startRequest();
    expect(screen.getByText('11.85')).toBeInTheDocument();
    expect(screen.queryByText('Card service unavailable')).not.toBeInTheDocument();
    showCards();
    expect(screen.getByText('Card service unavailable')).toBeInTheDocument();
  });

  it('settles an empty card response as unavailable without changing the P2P quote', async () => {
    mocks.fetchBlueRate.mockResolvedValue(quote());
    mocks.fetchCardRates.mockResolvedValue(null);
    render(<BlueRateCards />);
    await startRequest();
    expect(screen.getByText('11.85')).toBeInTheDocument();
    showCards();
    expect(screen.getByText('cardRateUnavailable')).toBeInTheDocument();
  });

  it('does not delay or overwrite the card tab when the P2P request fails', async () => {
    mocks.fetchBlueRate.mockRejectedValue(new Error('P2P unavailable'));
    mocks.fetchCardRates.mockResolvedValue(card());
    render(<BlueRateCards />);
    await startRequest();
    expect(screen.getAllByText('P2P unavailable')).toHaveLength(2);
    showCards();
    expect(screen.getByText('7.20')).toBeInTheDocument();
  });

  it('retains same-currency stale P2P data on refresh failure and labels retained card data', async () => {
    mocks.fetchBlueRate.mockResolvedValueOnce(quote()).mockRejectedValueOnce(new Error('P2P offline'));
    mocks.fetchCardRates.mockResolvedValueOnce(card()).mockRejectedValueOnce(new Error('Card offline'));
    render(<BlueRateCards />);
    await startRequest();
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(screen.getByText('11.85')).toBeInTheDocument();
    expect(screen.getAllByText('stale')).toHaveLength(2);
    showCards();
    expect(screen.getByText('7.20')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing the previous reading');
  });

  it('clears an old card reading when a completed refresh says it is unavailable', async () => {
    mocks.fetchBlueRate.mockResolvedValue(quote());
    mocks.fetchCardRates.mockResolvedValueOnce(card()).mockResolvedValueOnce(null);
    render(<BlueRateCards />);
    await startRequest();
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    showCards();
    expect(screen.queryByText('7.20')).not.toBeInTheDocument();
    expect(screen.getByText('cardRateUnavailable')).toBeInTheDocument();
  });
});

describe('request races', () => {
  it('does not show the previous currency during debounce or reuse it after the new currency fails', async () => {
    mocks.fetchBlueRate.mockResolvedValueOnce(quote()).mockRejectedValueOnce(new Error('BRL unavailable'));
    const { rerender } = render(<BlueRateCards />);
    await startRequest();
    expect(screen.getByText('11.85')).toBeInTheDocument();
    mocks.currency = 'BRL';
    rerender(<BlueRateCards />);
    expect(screen.queryByText('11.850')).not.toBeInTheDocument();
    expect(screen.queryByText('11.85')).not.toBeInTheDocument();
    await startRequest();
    expect(screen.getAllByText('BRL unavailable')).toHaveLength(2);
    expect(screen.queryByText('11.850')).not.toBeInTheDocument();
  });

  it('ignores both old request branches after a newer currency wins', async () => {
    const oldBlue = deferred(), oldCards = deferred();
    mocks.fetchBlueRate.mockReturnValueOnce(oldBlue.promise).mockResolvedValueOnce(quote(2.25, 2.35));
    mocks.fetchCardRates.mockReturnValueOnce(oldCards.promise).mockResolvedValueOnce(card(7.4));
    const { rerender } = render(<BlueRateCards />);
    await startRequest();
    mocks.currency = 'BRL';
    rerender(<BlueRateCards />);
    await startRequest();
    await settle(() => { oldBlue.resolve(quote()); oldCards.resolve(card()); });
    expect(screen.getByText('2.250')).toBeInTheDocument();
    expect(screen.queryByText('11.850')).not.toBeInTheDocument();
    showCards();
    expect(screen.getByText('7.40')).toBeInTheDocument();
    expect(screen.queryByText('7.20')).not.toBeInTheDocument();
    expect(mocks.trackRateUpdate).toHaveBeenCalledTimes(1);
  });

  it('ignores a cancelled card failure instead of replacing the new card result', async () => {
    const oldCards = deferred();
    mocks.fetchBlueRate.mockResolvedValue(quote());
    mocks.fetchCardRates.mockReturnValueOnce(oldCards.promise).mockResolvedValueOnce(card(7.4));
    const { rerender } = render(<BlueRateCards />);
    await startRequest();
    mocks.currency = 'EUR';
    rerender(<BlueRateCards />);
    await startRequest();
    await settle(() => oldCards.reject(new Error('Old card error')));
    showCards();
    expect(screen.getByText('7.40')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Old card error')).not.toBeInTheDocument();
  });

  it('ignores late success/failure after unmount and does not start another refresh', async () => {
    const blue = deferred(), cards = deferred();
    mocks.fetchBlueRate.mockReturnValue(blue.promise);
    mocks.fetchCardRates.mockReturnValue(cards.promise);
    const { unmount } = render(<BlueRateCards />);
    await startRequest();
    unmount();
    await settle(() => { blue.resolve(quote()); cards.reject(new Error('Late failure')); });
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(mocks.trackRateUpdate).not.toHaveBeenCalled();
    expect(mocks.fetchBlueRate).toHaveBeenCalledTimes(1);
    expect(mocks.fetchCardRates).toHaveBeenCalledTimes(1);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
