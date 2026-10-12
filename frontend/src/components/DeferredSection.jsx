import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import LazyErrorBoundary from './LazyErrorBoundary';

function isCurrentHashTarget(id) {
  try { return decodeURIComponent(window.location.hash.slice(1)) === id; } catch { return false; }
}

/** Keep optional below-fold work off the quote's initial render path. */
export default function DeferredSection({ id, title, description, language, className = '', forceLoad = false, children }) {
  const [started, setStarted] = useState(false);
  const [hashRequest, setHashRequest] = useState(0);
  const regionRef = useRef(null);
  const focusOnStart = useRef(false);
  const requestedEntry = useRef(null);
  const es = language === 'es';

  const reveal = useCallback(() => {
    if (regionRef.current?.contains(document.activeElement)) focusOnStart.current = true;
    setStarted(true);
  }, []);

  useEffect(() => {
    const revealHashTarget = () => {
      if (isCurrentHashTarget(id)) {
        // Native hashchange and router navigation can describe the same entry.
        const entry = `${window.location.href}|${window.history.state?.key || ''}`;
        if (requestedEntry.current === entry) return;
        requestedEntry.current = entry;
        reveal();
        setHashRequest(request => request + 1);
      } else requestedEntry.current = null;
    };
    revealHashTarget();
    window.addEventListener('hashchange', revealHashTarget);
    window.addEventListener('bolivia-blue:home-hash', revealHashTarget);
    return () => {
      window.removeEventListener('hashchange', revealHashTarget);
      window.removeEventListener('bolivia-blue:home-hash', revealHashTarget);
    };
  }, [id, reveal]);

  useEffect(() => {
    if (started) return undefined;
    let observer;
    if (forceLoad || typeof IntersectionObserver === 'undefined') {
      reveal();
    } else {
      try {
        observer = new IntersectionObserver((entries) => {
          if (entries.some(entry => entry.isIntersecting)) reveal();
        }, { rootMargin: '300px 0px' });
        observer.observe(regionRef.current);
      } catch {
        // Content remains reachable in browsers with an unavailable/broken observer.
        reveal();
      }
    }
    return () => {
      observer?.disconnect();
    };
  }, [started, forceLoad, reveal]);

  useEffect(() => {
    if (!started || !hashRequest) return undefined;
    // The crawl shell has no optional-section anchors. Wait until React has
    // mounted the target and its mobile parent has expanded, then honor only
    // the still-current explicit hash. IO activation and rerenders never scroll.
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
    let cancelled = false;
    const cancel = () => { cancelled = true; window.cancelAnimationFrame(frame); removeListeners(); };
    const removeListeners = () => events.forEach(event => window.removeEventListener(event, cancel));
    const frame = window.requestAnimationFrame(() => {
      removeListeners();
      if (!cancelled && isCurrentHashTarget(id)) regionRef.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    });
    events.forEach(event => window.addEventListener(event, cancel, { passive: true }));
    return () => { window.cancelAnimationFrame(frame); removeListeners(); };
  }, [started, hashRequest, id]);

  useEffect(() => {
    if (started && focusOnStart.current) {
      // The activation button is replaced by the section. Keep keyboard focus
      // here so the next Tab continues into its controls instead of the header.
      regionRef.current?.focus({ preventScroll: true });
      focusOnStart.current = false;
    }
  }, [started]);

  const placeholder = (loading) => (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-3 max-w-lg text-sm text-gray-600 dark:text-gray-300">{description}</p>
      {loading ? (
        <p role="status" className="mt-4 text-sm text-gray-600 dark:text-gray-300">{es ? 'Cargando sección…' : 'Loading section…'}</p>
      ) : (
        <button
          type="button"
          onClick={() => { focusOnStart.current = true; setStarted(true); }}
          className="mt-4 min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {es ? 'Cargar sección' : 'Load section'}
        </button>
      )}
    </div>
  );

  return (
    <div
      id={id}
      ref={regionRef}
      role="region"
      aria-label={title}
      tabIndex={-1}
      data-deferred-section
      data-started={started}
      className={`flex flex-col ${className}`}
      style={{ scrollMarginTop: 'calc(var(--bb-header-height, 5rem) + 1rem)' }}
    >
      {started ? (
        <LazyErrorBoundary>
          <Suspense fallback={placeholder(true)}>{children}</Suspense>
        </LazyErrorBoundary>
      ) : placeholder(false)}
    </div>
  );
}
