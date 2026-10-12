import { lazy, useEffect } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeferredSection from '../components/DeferredSection';

const { blockAds } = vi.hoisted(() => ({ blockAds: vi.fn() }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en' }) }));
vi.mock('../utils/adsenseLoader', () => ({ blockAdsOnThisPage: blockAds }));

let observers;
beforeEach(() => {
  observers = [];
  window.history.replaceState({}, '', '/');
  vi.clearAllMocks();
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      observers.push(this);
    }
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function fixture() {
  let resolve, reject;
  const onMount = vi.fn();
  const request = vi.fn(() => new Promise((yes, no) => { resolve = yes; reject = no; }));
  function Contents() {
    useEffect(onMount, []);
    return <button>Chart controls</button>;
  }
  const Child = lazy(request);
  const element = (props = {}) => <DeferredSection id="home-history" title="Rate history" description="P2P buy and sell history." language="en" className="min-h-[440px] sm:min-h-[480px] md:min-h-[600px]" {...props}><Child /></DeferredSection>;
  return { request, onMount, element, resolve: () => resolve({ default: Contents }), reject: () => reject(new Error('Chunk unavailable')) };
}

describe('deferred section lifecycle', () => {
  it('renders meaningful content without starting the lazy import or child effects', () => {
    const f = fixture();
    render(f.element());
    expect(f.request).not.toHaveBeenCalled();
    expect(f.onMount).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Rate history' })).toBeInTheDocument();
    expect(screen.getByText('P2P buy and sell history.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load section' })).toBeInTheDocument();
    expect(observers[0].options).toEqual({ rootMargin: '300px 0px' });
    expect(observers[0].observe).toHaveBeenCalledWith(screen.getByRole('region'));
  });

  it('starts once near the viewport, keeps the reserved geometry and stays mounted after leaving it', async () => {
    const f = fixture();
    const { rerender } = render(f.element());
    const region = screen.getByRole('region');
    const classes = region.className;
    act(() => observers[0].callback([{ isIntersecting: false }]));
    expect(f.request).not.toHaveBeenCalled();
    act(() => observers[0].callback([{ isIntersecting: true }]));
    expect(f.request).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading section');
    expect(region.className).toBe(classes);
    await act(async () => f.resolve());
    expect(screen.getByRole('button', { name: 'Chart controls' })).toBeInTheDocument();
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    act(() => observers[0].callback([{ isIntersecting: false }]));
    rerender(f.element());
    expect(f.onMount).toHaveBeenCalledTimes(1);
    expect(f.request).toHaveBeenCalledTimes(1);
    expect(region.className).toBe(classes);
  });

  it('supports explicit keyboard-accessible activation and retains focus when replacing the button', async () => {
    const f = fixture();
    render(f.element());
    const button = screen.getByRole('button', { name: 'Load section' });
    button.focus();
    fireEvent.click(button);
    expect(screen.getByRole('region')).toHaveFocus();
    await act(async () => f.resolve());
    expect(screen.getByRole('region')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Chart controls' })).toBeInTheDocument();
  });

  it('preserves keyboard focus when tabbing into the placeholder triggers automatic viewport loading', async () => {
    const f = fixture();
    render(f.element());
    screen.getByRole('button', { name: 'Load section' }).focus();
    act(() => observers[0].callback([{ isIntersecting: true }]));
    expect(screen.getByRole('region')).toHaveFocus();
    await act(async () => f.resolve());
    expect(screen.getByRole('region')).toHaveFocus();
  });

  it('reveals mobile news immediately when expanded and does not unload it when collapsed again', async () => {
    const f = fixture();
    const { rerender } = render(f.element({ forceLoad: false }));
    expect(f.request).not.toHaveBeenCalled();
    rerender(f.element({ forceLoad: true }));
    await act(async () => f.resolve());
    rerender(f.element({ forceLoad: false }));
    expect(f.request).toHaveBeenCalledTimes(1);
    expect(f.onMount).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Chart controls' })).toBeInTheDocument();
  });

  for (const mode of ['missing', 'throws']) it(`loads safely when IntersectionObserver is ${mode}`, async () => {
    vi.stubGlobal('IntersectionObserver', mode === 'missing' ? undefined : class { constructor() { throw new Error('Unsupported'); } });
    const f = fixture();
    render(f.element());
    expect(f.request).toHaveBeenCalledTimes(1);
    await act(async () => f.resolve());
    expect(screen.getByRole('button', { name: 'Chart controls' })).toBeInTheDocument();
  });

  it('loads the initial hash target and later hash navigation without an intersection', async () => {
    window.history.replaceState({}, '', '/#home-history');
    const first = fixture();
    const { unmount } = render(first.element());
    expect(first.request).toHaveBeenCalledTimes(1);
    await act(async () => first.resolve());
    unmount();
    window.history.replaceState({}, '', '/');
    const second = fixture();
    render(second.element());
    expect(second.request).not.toHaveBeenCalled();
    act(() => {
      window.history.replaceState({}, '', '/#home-history');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(second.request).toHaveBeenCalledTimes(1);
    await act(async () => second.resolve());
  });

  it('does not mistake unrelated or malformed hashes for a reveal request', () => {
    window.history.replaceState({}, '', '/#%invalid');
    const f = fixture();
    render(f.element());
    act(() => {
      window.history.replaceState({}, '', '/#price-alerts');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(f.request).not.toHaveBeenCalled();
  });

  it('cleans up the observer and hash listener when removed before it starts', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const f = fixture();
    const { unmount } = render(f.element());
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
    expect(f.request).not.toHaveBeenCalled();
  });

  it('keeps a readable section-level error when a lazy chunk fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    render(f.element());
    fireEvent.click(screen.getByRole('button', { name: 'Load section' }));
    await act(async () => f.reject());
    expect(screen.getByText('Failed to load component')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh page' })).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveClass('min-h-[440px]');
    expect(blockAds).toHaveBeenCalled();
  });

  it('renders Spanish loading and activation copy', async () => {
    const f = fixture();
    render(f.element({ language: 'es' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cargar sección' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando sección');
    await act(async () => f.resolve());
  });
});
