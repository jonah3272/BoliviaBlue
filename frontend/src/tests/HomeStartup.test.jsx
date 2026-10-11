import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, useNavigate } from 'react-router-dom';
import App from '../App';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { startInitialApp } from '../utils/startInitialApp';

vi.mock('../components/MobileBottomNav', () => ({ default: () => null }));
vi.mock('../components/RateAlertFab', () => ({ default: () => null }));
vi.mock('../hooks/useAdReservedSpace', () => ({ default: () => {} }));
vi.mock('../hooks/usePageTracking', () => ({ usePageTracking: () => {} }));
vi.mock('../utils/analyticsEvents', () => ({ trackLanguageSwitched: () => {} }));
vi.mock('../pages/About', () => ({ default: () => <div>About route<Link to="/">Home</Link></div> }));
vi.mock('../pages/Home', () => ({ default: () => <div>Lazy home route</div> }));

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fixture(search = '') {
  const rootElement = document.createElement('div');
  rootElement.innerHTML = '<main data-seo-shell="home"><h1>Initial headline</h1><p>Initial dated observation</p><a href="/calculadora">Calculator</a></main>';
  document.body.append(rootElement);
  let resolve;
  let reject;
  const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
  const mount = vi.fn();
  const loadHome = vi.fn(() => pending);
  const retry = vi.fn();
  const ready = startInitialApp({ rootElement, location: { pathname: '/', search }, loadHome, mount, retry });
  return { rootElement, resolve, reject, mount, loadHome, retry, ready };
}

describe('homepage initial module loading', () => {
  it('retains the exact readable shell until the resolved component can mount', async () => {
    vi.useFakeTimers();
    const f = fixture('?lang=en&utm_source=test#rate');
    const shell = f.rootElement.firstChild;
    await vi.advanceTimersByTimeAsync(14000);
    expect(f.rootElement.firstChild).toBe(shell);
    expect(shell.textContent).toContain('Initial dated observation');
    expect(f.mount).not.toHaveBeenCalled();
    expect(f.rootElement.querySelector('[data-home-startup-notice]')).toBeNull();
    const Home = () => null;
    f.resolve({ default: Home });
    await f.ready;
    expect(f.mount).toHaveBeenCalledTimes(1);
    expect(f.mount).toHaveBeenCalledWith(Home);
    expect(f.rootElement.firstChild).toBe(shell);
    expect(f.rootElement.hasAttribute('data-loading-state')).toBe(false);
    expect(f.rootElement.hasAttribute('data-adsense-block')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  for (const language of ['es', 'en']) {
    it(`${language}: failure preserves content and offers explicit reload without looping`, async () => {
      vi.useFakeTimers();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const f = fixture(`?lang=${language}`);
      const shell = f.rootElement.firstChild;
      f.reject(new Error('Chunk fetch failed'));
      await f.ready;
      expect(shell.isConnected).toBe(true);
      expect(f.mount).not.toHaveBeenCalled();
      expect(f.rootElement.getAttribute('data-adsense-block')).toBe('initial-home');
      expect(screen.getByRole('status')).toHaveTextContent(language === 'en' ? 'initial snapshot' : 'lectura inicial');
      fireEvent.click(screen.getByRole('button', { name: language === 'en' ? 'Reload page' : 'Recargar página' }));
      expect(f.retry).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(60000);
      expect(f.loadHome).toHaveBeenCalledTimes(1);
      expect(f.retry).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });
  }

  it('shows one bounded slow-load notice and can still recover on late success', async () => {
    vi.useFakeTimers();
    const f = fixture();
    await vi.advanceTimersByTimeAsync(15000);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByText('Initial dated observation')).toBeVisible();
    expect(f.mount).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    const Home = () => null;
    f.resolve({ default: Home });
    await f.ready;
    expect(screen.queryByRole('status')).toBeNull();
    expect(f.mount).toHaveBeenCalledTimes(1);
    expect(f.mount).toHaveBeenCalledWith(Home);
  });

  it('starts non-home routes immediately without downloading Home', async () => {
    const mount = vi.fn();
    const loadHome = vi.fn();
    await startInitialApp({ location: { pathname: '/calculadora', search: '?lang=en' }, loadHome, mount });
    expect(mount).toHaveBeenCalledTimes(1);
    expect(mount).toHaveBeenCalledWith();
    expect(loadHome).not.toHaveBeenCalled();
  });
});

function ResolvedHome() {
  const { language } = useLanguage();
  return <main><h1>{language === 'en' ? 'English homepage' : 'Página principal'}</h1><Link to="/acerca-de">About</Link></main>;
}
function HistoryButtons() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate(1)}>Forward</button></>;
}
function app(initialEntry, initialHome) {
  return render(<MemoryRouter initialEntries={[initialEntry]}><LanguageProvider><App initialHome={initialHome} /><HistoryButtons /></LanguageProvider></MemoryRouter>);
}

describe('resolved homepage routing', () => {
  for (const language of ['es', 'en']) {
    it(`${language}: renders Home immediately without first-render Suspense, then navigates away and back`, async () => {
      const { container } = app(`/?lang=${language}&utm_source=test`, ResolvedHome);
      const heading = language === 'en' ? 'English homepage' : 'Página principal';
      expect(screen.getByRole('heading', { name: heading })).toBeVisible();
      expect(container.querySelector('[data-loading-state]')).toBeNull();
      fireEvent.click(screen.getByRole('link', { name: 'About' }));
      await screen.findByText('About route');
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('heading', { name: heading })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
      await screen.findByText('About route');
      fireEvent.click(screen.getByRole('link', { name: 'Home' }));
      expect(screen.getByRole('heading', { name: heading })).toBeVisible();
      expect(container.querySelector('[data-loading-state]')).toBeNull();
    });
  }
  it('keeps the lazy homepage available when starting on another route', async () => {
    app('/acerca-de');
    await screen.findByText('About route');
    await act(async () => { fireEvent.click(screen.getByRole('link', { name: 'Home' })); });
    expect(await screen.findByText('Lazy home route')).toBeVisible();
  });
});
