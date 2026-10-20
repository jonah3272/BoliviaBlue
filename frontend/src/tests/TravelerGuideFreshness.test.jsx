import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TravelersMoneyGuide from '../pages/TravelersMoneyGuide';
import { travelerGuideMeta } from '../utils/travelerGuideMeta';
const captures = vi.hoisted(() => ({ cards: null }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../components/BlueRateCards', () => ({ default: props => { captures.cards = props; return <div>Independent rate cards</div>; } }));
vi.mock('../components/BrandButton', () => ({ BinanceButton: () => <a href="https://www.binance.com">Binance</a> }));
vi.mock('../components/SantaCruzPartnerLinks', () => ({ default: () => null }));
vi.mock('../components/NewsletterSignup', () => ({ default: () => null }));
vi.mock('../components/PaymentCostChecker', () => ({ default: ({ language }) => <div data-testid="checker">{language}</div> }));
vi.mock('../components/ContextualDiscoveryLink', () => ({ default: () => null }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
for (const [path, language] of [['/guia-dinero-bolivia', 'es'], ['/bolivia-money-guide', 'en']]) {
  it(`${path} keeps honest metadata after mounting and preserves checker/language`, async () => {
    const model = travelerGuideMeta(language);
    render(<MemoryRouter initialEntries={[path]}><TravelersMoneyGuide /></MemoryRouter>);
    await waitFor(() => expect(document.title).toBe(model.title));
    expect(document.head.querySelector('meta[name="description"]').content).toBe(model.description);
    expect(document.head.querySelector('link[rel="canonical"]').href).toBe(`https://www.boliviablue.com${path}`);
    const article = [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)).find(item => item['@type'] === 'Article');
    expect(article.description).toBe(model.description);
    expect(article.description).not.toMatch(/Tasas en vivo|Live rates/);
    expect(captures.cards.showTimestampInCards).toBe(true);
    expect(captures.cards.includeExchangeSchema).toBe(false);
    expect(screen.getByTestId('checker')).toHaveTextContent(language);
    expect(screen.getByText(language === 'es' ? /Sin una hora de observación válida/ : /Without a valid observation time/)).toBeTruthy();
  });
}
