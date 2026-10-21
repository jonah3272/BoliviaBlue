import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RateTrioStrip from '../components/RateTrioStrip';

const card = vi.hoisted(() => vi.fn());
vi.mock('../utils/api', () => ({ fetchCardRates: card }));
const props = { buy: 11.92, sell: 11.88, updatedAt: '2026-10-21T15:01:05Z' };
const mount = (language, extra = {}) => render(<MemoryRouter><RateTrioStrip {...props} language={language} cardRate={11.76} {...extra} /></MemoryRouter>);
beforeEach(() => { card.mockReset(); card.mockResolvedValue(null); });
afterEach(cleanup);

for (const language of ['en', 'es']) describe(`payment decision copy (${language})`, () => {
  const es = language === 'es';
  it('leads with cash/card guidance, keeps caveats visible, and makes technical comparisons secondary', () => {
    const { container } = mount(language);
    expect(screen.getByRole('heading', { name: es ? '¿Efectivo o tarjeta: qué sale más barato?' : 'Cash or card: which costs less?' })).toBeInTheDocument();
    expect(screen.getByText(es ? /Para el mismo precio en bolivianos/ : /For the same price in bolivianos/)).toBeVisible();
    expect(screen.getByText(es ? /Conviene si tu casa de cambio/ : /Costs less if your exchange shop/)).toBeVisible();
    expect(screen.getByText(es ? /Lo que te ofrecen por efectivo puede ser distinto/ : /Your cash exchange offer may differ/)).toBeVisible();
    expect(screen.getByText(es ? /no garantiza la tasa de tu tarjeta/ : /not a guaranteed card rate/)).toBeVisible();
    expect(screen.getByText(es ? /Tu banco puede aplicar otra tasa y comisiones/ : /Your bank’s final rate and fees may differ/)).toBeVisible();
    expect(screen.getByText('Bs/USDT')).toBeInTheDocument();
    expect(screen.getAllByText('Bs/USD')).toHaveLength(2);
    const details = container.querySelector('details');
    expect(details.open).toBe(false);
    expect(details.textContent).toContain('-1.2%');
    expect(details.textContent).toContain(es ? 'no determinan' : 'do not determine');
    expect(container.querySelector('ul').compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(card).not.toHaveBeenCalled();
  });

  it.each([12.10, 11.90, 11.76])('does not declare a cash winner from P2P comparison when card rate is %s', (cardRate) => {
    mount(language, { cardRate });
    expect(screen.getByText(es ? /Conviene si su tasa supera/ : /Costs less if its rate beats/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Cash is cheaper|Card is cheaper|El efectivo es más barato|La tarjeta es más barata/);
  });

  it('preserves card-fee handoff on repeated clicks without mislabelling it as a cash quote calculator', () => {
    const tabs = document.createElement('div');
    tabs.dataset.rateModeTabs = '';
    tabs.scrollIntoView = vi.fn();
    document.body.append(tabs);
    const listener = vi.fn();
    window.addEventListener('bolivia-blue:set-rate-mode', listener);
    mount(language);
    const link = screen.getByRole('link', { name: es ? 'Revisar mi comisión de tarjeta →' : 'Check my card fee →' });
    fireEvent.click(link); fireEvent.click(link);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0].detail).toBe('card');
    expect(tabs.scrollIntoView).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('link', { name: es ? 'Guía de dinero para viajeros' : 'Traveler money guide' })).toHaveAttribute('href', es ? '/guia-dinero-bolivia' : '/bolivia-money-guide');
    window.removeEventListener('bolivia-blue:set-rate-mode', listener); tabs.remove();
  });

  it('keeps guidance honest when estimates fail to load', async () => {
    card.mockRejectedValue(new Error('Unavailable'));
    await act(async () => mount(language, { buy: null, sell: null, cardRate: null }));
    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(document.body.textContent).not.toContain('NaN');
    expect(document.body.textContent).not.toContain('Infinity');
    expect(document.body.textContent).not.toContain('-1.2%');
  });
});
