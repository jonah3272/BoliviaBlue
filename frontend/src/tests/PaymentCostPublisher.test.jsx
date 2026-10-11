import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Widget from '../pages/Widget';
const state = vi.hoisted(() => ({ language: 'en' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => state }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/PageMeta', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
beforeEach(() => { state.language = 'en'; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const mount = () => render(<MemoryRouter><Widget /></MemoryRouter>);

it.each(['en', 'es'])('generates the %s embed and guide link without numeric prefill', (language) => {
  state.language = language;
  mount();
  const code = screen.getByRole('textbox');
  const parsed = new DOMParser().parseFromString(code.value, 'text/html');
  const frame = parsed.querySelector('iframe');
  expect(new URL(frame.src).searchParams.get('mode')).toBe('payment-cost');
  expect(new URL(frame.src).searchParams.get('lang')).toBe(language);
  expect([...new URL(frame.src).searchParams.keys()]).toEqual(['mode', 'lang']);
  expect(frame.getAttribute('width')).toBe('100%');
  expect(frame.getAttribute('height')).toBe('900');
  expect(frame.hasAttribute('scrolling')).toBe(false);
  expect(parsed.querySelector('a').href).toContain(language === 'en' ? '/bolivia-money-guide#' : '/guia-dinero-bolivia#');
  expect(document.querySelector('iframe').getAttribute('src')).toBe(`/embed.html?mode=payment-cost&lang=${language}`);
});

it('copies the exact complete snippet', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Copy checker code' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Code copied.'));
  expect(writeText).toHaveBeenCalledWith(screen.getByRole('textbox').value);
});

it.each(['missing', 'denied'])('retains selectable code when clipboard is %s, then permits retry', async (failure) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: failure === 'missing' ? undefined : { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Copy checker code' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Automatic copying failed'));
  const code = screen.getByRole('textbox');
  expect(code).toBeVisible();
  fireEvent.focus(code);
  expect(code.selectionStart).toBe(0);
  expect(code.selectionEnd).toBe(code.value.length);
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  fireEvent.click(screen.getByRole('button', { name: 'Copy checker code' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Code copied.'));
});
