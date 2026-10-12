import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Home from '../pages/Home';
import { usePageTracking } from '../hooks/usePageTracking';

const mocks = vi.hoisted(() => ({
  language: 'en', t: key => key, chart: vi.fn(), sentiment: vi.fn(), news: vi.fn(), tweets: vi.fn(),
  rate: { buy: 11.85, sell: 12.05, updated_at_iso: '2026-10-12T16:30:00Z' },
}));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: mocks.language, t: mocks.t }) }));
vi.mock('../contexts/RateContext', () => ({ useRate: () => ({ rateData: mocks.rate, error: null, isLoading: false }) }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/PageMeta', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/AdSenseAutoAds', () => ({ default: () => null }));
vi.mock('../components/RateBinanceCta', () => ({ default: () => null }));
vi.mock('../components/RateTrioStrip', () => ({ default: () => null }));
vi.mock('../components/TravelersGuideTeaser', () => ({ default: () => null }));
vi.mock('../components/NewsletterSignup', () => ({ default: () => null }));
vi.mock('../components/SocialShare', () => ({ default: () => null }));
vi.mock('../components/MobileMoneyActions', () => ({ default: () => null }));
vi.mock('../components/FinancialOfferCard', () => ({ FinancialOfferButton: ({ children }) => <button>{children}</button> }));
vi.mock('../components/SourceObservationPanel', () => ({ default: () => <p>Source observation</p> }));
vi.mock('../components/BlueRateCards', () => ({ default: ({ setShowOfficial }) => <button onClick={() => setShowOfficial(true)}>Show official rates</button> }));
vi.mock('../components/BlueChart', () => ({ default: ({ showOfficial }) => { mocks.chart(); return <p>Chart official: {String(showOfficial)}</p>; } }));
vi.mock('../components/SentimentNewsCard', () => ({ default: () => { mocks.sentiment(); return <p>Sentiment loaded</p>; } }));
vi.mock('../components/NewsFeed', () => ({ default: () => { mocks.news(); return <p>News loaded</p>; } }));
vi.mock('../components/TweetsFeed', () => ({ default: () => { mocks.tweets(); return <p>X archive loaded</p>; } }));
vi.mock('../components/RateAlertForm', () => ({ default: () => <p>Price alerts loaded</p> }));
vi.mock('../utils/adsenseLoader', () => ({ blockAdsOnThisPage: vi.fn() }));
vi.mock('../utils/analytics', () => ({ trackPageView: vi.fn(), initScrollDepthTracking: vi.fn(), initTimeOnPageTracking: vi.fn() }));

let observers;
beforeEach(() => {
  observers = [];
  mocks.language = 'en';
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) { this.callback = callback; }
    observe(node) { this.node = node; observers.push(this); }
    disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const mount = async () => { await act(async () => render(<MemoryRouter><Home /></MemoryRouter>)); };

for (const language of ['es', 'en']) it(`${language}: initial quote, source and alerts stay available without mounting optional sections`, async () => {
  mocks.language = language;
  await mount();
  expect(document.querySelector('[data-home-hero-rates]')).toHaveTextContent('11.85');
  expect(document.querySelector('[data-home-hero-rates]')).toHaveTextContent('12.05');
  expect(screen.getByText('Source observation')).toBeInTheDocument();
  expect(document.querySelector('[data-rate-reading-guide]')).toBeInTheDocument();
  expect(document.querySelector('#price-alerts')).toHaveTextContent('Price alerts loaded');
  expect(mocks.chart).not.toHaveBeenCalled();
  expect(mocks.sentiment).not.toHaveBeenCalled();
  expect(mocks.news).not.toHaveBeenCalled();
  expect(mocks.tweets).not.toHaveBeenCalled();
  expect(observers.map(o => o.node.id)).toEqual(['home-history', 'home-sentiment', 'home-news']);
});

it('honors the latest official-rate choice when the chart comes into view', async () => {
  await mount();
  fireEvent.click(screen.getByRole('button', { name: 'Show official rates' }));
  await act(async () => observers.find(o => o.node.id === 'home-history').callback([{ isIntersecting: true }]));
  expect(screen.getByText('Chart official: true')).toBeInTheDocument();
  expect(mocks.sentiment).not.toHaveBeenCalled();
  expect(mocks.news).not.toHaveBeenCalled();
});

it('expands mobile news without an observer callback, preserves tab behavior and keeps its state after collapse', async () => {
  await mount();
  const expand = screen.getByRole('button', { name: 'News & Twitter' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  await act(async () => fireEvent.click(expand));
  expect(expand).toHaveAttribute('aria-expanded', 'true');
  expect(await screen.findByText('News loaded')).toBeInTheDocument();
  const region = screen.getByRole('region', { name: 'Economic news and X archive' });
  fireEvent.click(within(region).getByRole('button', { name: 'X archive' }));
  expect(screen.getByText('X archive loaded')).toBeInTheDocument();
  fireEvent.click(expand);
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(expand);
  expect(screen.getByText('X archive loaded')).toBeInTheDocument();
  expect(document.querySelector('#home-news-panel')).toHaveClass('block');
});

for (const hash of ['#home-news', '#home%2Dnews']) it(`expands the ${hash} news target even on the collapsed mobile path`, async () => {
  window.history.replaceState({}, '', `/${hash}`);
  await mount();
  expect(screen.getByRole('button', { name: 'News & Twitter' })).toHaveAttribute('aria-expanded', 'true');
  expect(document.querySelector('#home-news-panel')).toHaveClass('block');
  expect(await screen.findByText('News loaded')).toBeInTheDocument();
});

it('leaves mobile news collapsed for a malformed hash', async () => {
  window.history.replaceState({}, '', '/#%invalid');
  await mount();
  expect(document.querySelector('#home-news-panel')).toHaveClass('hidden');
  expect(mocks.news).not.toHaveBeenCalled();
});

it('responds to later news hash navigation without mounting the chart or sentiment', async () => {
  await mount();
  await act(async () => {
    window.history.replaceState({}, '', '/#home-news');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  expect(screen.getByRole('button', { name: 'News & Twitter' })).toHaveAttribute('aria-expanded', 'true');
  expect(await screen.findByText('News loaded')).toBeInTheDocument();
  expect(mocks.chart).not.toHaveBeenCalled();
  expect(mocks.sentiment).not.toHaveBeenCalled();
});

it('falls back to rendering optional content when the browser lacks IntersectionObserver, keeping mobile news collapsed', async () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  await mount();
  expect(await screen.findByText('News loaded')).toBeInTheDocument();
  expect(await screen.findByText('Sentiment loaded')).toBeInTheDocument();
  expect(await screen.findByText('Chart official: false')).toBeInTheDocument();
  expect(document.querySelector('#home-news-panel')).toHaveClass('hidden');
  expect(screen.getByRole('button', { name: 'News & Twitter' })).toHaveAttribute('aria-expanded', 'false');
});

it('expands and scrolls same-page router hash navigation, including a repeated visit after collapse', async () => {
  const frames = new Map(); let frameId = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.set(++frameId, callback); return frameId; });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const flush = () => act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(0)); });
  function Navigation() {
    usePageTracking();
    const navigate = useNavigate();
    return <>
      <button onClick={() => navigate('/#home-news')}>Go to news</button>
      <button onClick={() => navigate('/?lang=es#home-news')}>Change language</button>
    </>;
  }
  await act(async () => render(<BrowserRouter><Navigation /><Home /></BrowserRouter>));
  const target = document.getElementById('home-news');
  target.scrollIntoView = vi.fn();
  const nav = screen.getByRole('button', { name: 'Go to news' });
  nav.focus();
  await act(async () => fireEvent.click(nav));
  expect(await screen.findByText('News loaded')).toBeInTheDocument();
  expect(document.querySelector('#home-news-panel')).toHaveClass('block');
  flush();
  expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  expect(nav).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'News & Twitter' }));
  expect(document.querySelector('#home-news-panel')).toHaveClass('hidden');
  await act(async () => fireEvent.click(nav));
  flush();
  expect(document.querySelector('#home-news-panel')).toHaveClass('block');
  expect(target.scrollIntoView).toHaveBeenCalledTimes(2);
  const language = screen.getByRole('button', { name: 'Change language' });
  language.focus();
  await act(async () => fireEvent.click(language));
  flush();
  expect(window.location.search).toBe('?lang=es');
  expect(document.querySelector('#home-news-panel')).toHaveClass('block');
  expect(target.scrollIntoView).toHaveBeenCalledTimes(2);
  expect(language).toHaveFocus();
});
