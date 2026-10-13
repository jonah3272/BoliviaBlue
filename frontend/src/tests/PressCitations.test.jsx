import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PressKit from '../pages/PressKit';
import { buildPressCitations } from '../utils/pressCitations';

const state = vi.hoisted(() => ({ language: 'es', rateData: null }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: state.language }) }));
vi.mock('../contexts/RateContext', () => ({ useRate: () => ({ rateData: state.rateData, isLoading: false, error: null }) }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/PageMeta', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));

const time = '2026-10-13T03:26:00Z';
const rate = { buy: 11.905, sell: 11.915, updatedAt: time, source_observation: { version: 1, observed_at: time, method: 'median_of_platform_quotes', quote_asset: 'USDT', fiat: 'BOB', platforms: [{ id: 'binance', buy: 11.905, sell: 11.915 }] } };
const press = () => <MemoryRouter><PressKit /></MemoryRouter>;
let writeText;
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse(time));
  state.rateData = rate;
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

for (const language of ['es', 'en']) describe(`press citation controls (${language})`, () => {
  beforeEach(() => { state.language = language; });
  it('copies the visible dated HTML, Markdown and one-line quote, including repeat clicks', async () => {
    const { container } = render(press());
    const expected = buildPressCitations(rate, language);
    expect(container.querySelectorAll('pre')[0].textContent).toBe(expected.html);
    expect(container.querySelectorAll('pre')[1].textContent).toBe(expected.markdown);
    const htmlButton = screen.getByRole('button', { name: language === 'es' ? 'Copiar HTML' : 'Copy HTML' });
    for (let i = 0; i < 2; i++) fireEvent.click(htmlButton);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenLastCalledWith(expected.html);
    fireEvent.click(screen.getByRole('button', { name: 'Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(expected.markdown));
    fireEvent.click(screen.getByRole('button', { name: language === 'es' ? 'Copiar cita' : 'Copy quote' }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(expected.text));
  });

  it('updates values and timestamp together, then removes numeric snippets if time disappears', async () => {
    const { container, rerender } = render(press());
    state.rateData = { buy: 12.1, sell: 12.2, updatedAt: '2026-10-13T03:36:00Z' };
    vi.mocked(Date.now).mockReturnValue(Date.parse(state.rateData.updatedAt));
    rerender(press());
    expect(container.querySelectorAll('pre')[0].textContent).toContain('2026-10-13T03:36:00Z');
    expect(container.querySelectorAll('pre')[0].textContent).toContain('12.10');
    expect(container.querySelectorAll('pre')[0].textContent).not.toContain(time);
    state.rateData = { ...state.rateData, updatedAt: null, fetchedAt: time };
    rerender(press());
    for (const pre of [...container.querySelectorAll('pre')].slice(0, 2)) expect(pre.textContent).not.toMatch(/12\.10|12\.20|2026-10-13/);
    fireEvent.click(screen.getByRole('button', { name: 'Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(buildPressCitations(state.rateData, language).markdown));
  });

  it('does not copy numeric values or source claims for a future-year observation', async () => {
    const future = '2027-10-13T03:26:00Z';
    state.rateData = { ...rate, updatedAt: future, source_observation: { ...rate.source_observation, observed_at: future } };
    const { container } = render(press());
    for (const pre of [...container.querySelectorAll('pre')].slice(0, 2)) expect(pre.textContent).not.toMatch(/11\.90|11\.91|2027|Binance P2P/);
    fireEvent.click(screen.getByRole('button', { name: 'Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(buildPressCitations(state.rateData, language).markdown));
    expect(writeText.mock.calls[0][0]).not.toContain(time);
  });

  it('keeps the dated citation selectable when copying fails and permits retry', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { container } = render(press());
    const expected = buildPressCitations(rate, language).html;
    const button = screen.getByRole('button', { name: language === 'es' ? 'Copiar HTML' : 'Copy HTML' });
    fireEvent.click(button);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(container.querySelectorAll('pre')[0]).toHaveTextContent(expected);
    fireEvent.click(button);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenLastCalledWith(expected);
  });
});

it('regenerates copy in English when the language changes', () => {
  state.language = 'es';
  const { container, rerender } = render(press());
  state.language = 'en';
  rerender(press());
  expect(container.querySelectorAll('pre')[0].textContent).toBe(buildPressCitations(rate, 'en').html);
  expect(screen.getByRole('heading', { name: 'Quote with observation time' })).toBeVisible();
});
