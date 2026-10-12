import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DeferredSection from '../components/DeferredSection';
import { usePageTracking } from '../hooks/usePageTracking';

const m = vi.hoisted(() => ({ language: 'en' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: m.language }) }));
vi.mock('../utils/adsenseLoader', () => ({ blockAdsOnThisPage: vi.fn() }));
vi.mock('../utils/analytics', () => ({ trackPageView: vi.fn(), initScrollDepthTracking: vi.fn(), initTimeOnPageTracking: vi.fn() }));
let frames, nextFrame, observers, scroll, originalScroll;
beforeEach(() => {
  frames = new Map(); nextFrame = 0; observers = []; m.language = 'en';
  window.history.replaceState({}, '', '/');
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.set(++nextFrame, callback); return nextFrame; });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
  originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
  scroll = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: scroll, configurable: true });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() {}
  });
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll);
  else delete Element.prototype.scrollIntoView;
  document.body.innerHTML = '';
});
const section = (props = {}) => <DeferredSection id="home-news" title="News" description="Recent stories" language="en" {...props}><button>News control</button></DeferredSection>;
const flushFrame = () => act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(0)); });
const navigateHash = hash => act(() => { window.history.replaceState({}, '', '/'+hash); window.dispatchEvent(new HashChangeEvent('hashchange')); });

for (const hash of ['#home-news', '#home%2Dnews']) it(`${hash}: scrolls once after mount and does not steal outside focus or repeat on rerender`, () => {
  window.history.replaceState({}, '', '/'+hash);
  const outside = document.createElement('button'); document.body.append(outside); outside.focus();
  const { rerender } = render(section());
  expect(scroll).not.toHaveBeenCalled();
  expect(frames.size).toBe(1);
  flushFrame();
  expect(scroll).toHaveBeenCalledTimes(1);
  expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
  expect(scroll.mock.instances[0]).toBe(screen.getByRole('region'));
  expect(outside).toHaveFocus();
  rerender(section({ language: 'es' })); flushFrame();
  expect(scroll).toHaveBeenCalledTimes(1);
  outside.remove();
});

it('handles later hash navigation even when the already-started target was collapsed', () => {
  const { rerender } = render(<div hidden>{section({ forceLoad: true })}</div>);
  expect(screen.getByText('News control')).toBeInTheDocument();
  expect(scroll).not.toHaveBeenCalled();
  navigateHash('#home-news');
  rerender(<div>{section({ forceLoad: true })}</div>);
  flushFrame();
  expect(scroll).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('region')).toBeVisible();
});

it('ignores an outdated hash before the scheduled frame', () => {
  render(section());
  navigateHash('#home-news');
  navigateHash('#price-alerts');
  flushFrame();
  expect(scroll).not.toHaveBeenCalled();
});

it('cancels the scheduled frame and listeners on unmount', () => {
  window.history.replaceState({}, '', '/#home-news');
  const remove = vi.spyOn(window, 'removeEventListener');
  const { unmount } = render(section());
  unmount(); flushFrame();
  expect(scroll).not.toHaveBeenCalled();
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
  expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
});

for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll']) it(`respects ${event} interaction before a pending hash scroll`, () => {
  window.history.replaceState({}, '', '/#home-news');
  render(section());
  act(() => window.dispatchEvent(new Event(event)));
  flushFrame();
  expect(scroll).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
});

for (const activation of ['observer', 'button', 'forced']) it(`does not scroll for ordinary ${activation} activation`, () => {
  render(section({ forceLoad: activation === 'forced' }));
  if (activation === 'observer') act(() => observers[0].callback([{ isIntersecting: true }]));
  if (activation === 'button') fireEvent.click(screen.getByRole('button', { name: 'Load section' }));
  flushFrame();
  expect(scroll).not.toHaveBeenCalled();
});

function Tracking() { usePageTracking(); return null; }
for (const hash of ['#home-history', '#home-sentiment', '#home-news', '#home%2Dnews']) it(`generic page tracking leaves ${hash} scrolling to the section even after locale changes`, () => {
  vi.useFakeTimers();
  const { rerender } = render(<MemoryRouter initialEntries={['/'+hash]}><Tracking /></MemoryRouter>);
  act(() => vi.advanceTimersByTime(101));
  m.language = 'es';
  rerender(<MemoryRouter initialEntries={['/'+hash]}><Tracking /></MemoryRouter>);
  act(() => vi.advanceTimersByTime(101));
  expect(scroll).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

for (const location of ['/#price-alerts', '/other#home-news']) it(`preserves generic anchor handling for ${location}`, () => {
  const target = document.createElement('div'); target.id = location.split('#')[1]; document.body.append(target);
  render(<MemoryRouter initialEntries={[location]}><Tracking /></MemoryRouter>);
  expect(scroll).toHaveBeenCalledTimes(1);
  expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  target.remove();
});
