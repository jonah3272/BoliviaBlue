import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SourceCompositionExample from '../components/SourceCompositionExample';
import { getSourceCompositionExample } from '../data/sourceCompositionExample';
import { renderSourceCompositionExample } from '../../../seo/dataDocumentationSeo';

const renderExample = (language, href = '/fuente-de-datos') => render(<MemoryRouter initialEntries={[href]}><SourceCompositionExample language={language} /></MemoryRouter>);
beforeEach(() => { Element.prototype.scrollIntoView = vi.fn(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const texts = (root, selector) => [...root.querySelectorAll(selector)].map((node) => node.textContent).filter(Boolean);

for (const language of ['es', 'en']) describe(`source-composition example (${language})`, () => {
  const e = getSourceCompositionExample(language);
  it('renders the same table, exact timestamps, calculations and selectable citation as initial HTML', () => {
    const { container } = renderExample(language, e.path);
    const initial = new DOMParser().parseFromString(renderSourceCompositionExample(language), 'text/html');
    for (const selector of ['p', 'h2', 'h3', 'th', 'td', 'li', 'caption', 'summary', 'time']) expect(texts(container, selector)).toEqual(texts(initial, selector));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(container.querySelectorAll('h1')).toHaveLength(0);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
    expect(screen.getByRole('link', { name: e.download })).toHaveAttribute('href', e.jsonUrl);
    expect(screen.getByRole('link', { name: e.download })).toHaveAttribute('download');
    expect(screen.getByRole('region', { name: e.caption })).toHaveClass('overflow-x-auto');
    expect(screen.getByText(e.citation)).toHaveClass('select-text', 'break-words');
    for (const [index, time] of [...container.querySelectorAll('time')].entries()) expect(time).toHaveAttribute('datetime', e.times[index].iso);
  });
  it('does not move the reader on ordinary methodology entry and copies exactly the dated citation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderExample(language);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: e.copy }));
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(e.copied));
    }
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith(e.citation);
  });
  for (const missing of [true, false]) it(`retains the complete citation when clipboard is ${missing ? 'missing' : 'denied'}, then permits retry`, async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: missing ? undefined : { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    renderExample(language);
    fireEvent.click(screen.getByRole('button', { name: e.copy }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(e.copyFailed));
    expect(screen.getByText(e.citation)).toBeVisible();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    fireEvent.click(screen.getByRole('button', { name: e.copy }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(e.copied));
    expect(writeText).toHaveBeenCalledWith(e.citation);
  });
});

it('clears copy feedback when switching language', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
  const { rerender } = renderExample('es');
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Cita copiada.'));
  rerender(<MemoryRouter><SourceCompositionExample language="en" /></MemoryRouter>);
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(getSourceCompositionExample('en').title);
});
