export const PAYMENT_COST_HASH = '#payment-cost-comparison';
export const isPaymentCostGuide = (location) => location?.hash === PAYMENT_COST_HASH &&
  ['/guia-dinero-bolivia', '/bolivia-money-guide'].includes(location.pathname);

/** Wait only for the initial lazy guide mount. Cleanup never alters URL/history. */
export function waitForPaymentCostAnchor(onSettled, win = typeof window === 'undefined' ? null : window, doc = typeof document === 'undefined' ? null : document) {
  if (!win || !doc || !isPaymentCostGuide(win.location)) return () => {};
  const entryUrl = win.location.href;
  let stopped = false;
  let frame = null;
  let observer;
  const events = ['wheel', 'touchstart', 'pointerdown', 'scroll', 'popstate', 'hashchange'];
  const stop = (settle) => {
    if (stopped) return;
    stopped = true;
    observer?.disconnect();
    if (frame !== null) win.cancelAnimationFrame(frame);
    for (const event of events) win.removeEventListener(event, cancel);
    win.removeEventListener('keydown', onKey);
    if (settle) onSettled?.();
  };
  const cancel = () => stop(true);
  const onKey = (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar', 'Tab'].includes(event.key)) cancel();
  };
  const attempt = () => {
    if (stopped || frame !== null) return;
    if (win.location.href !== entryUrl || win.scrollY !== 0) return stop(true);
    if (!doc.getElementById('payment-cost-comparison')) return;
    frame = win.requestAnimationFrame(() => {
      frame = null;
      if (win.location.href !== entryUrl || win.scrollY !== 0) return stop(true);
      const target = doc.getElementById('payment-cost-comparison');
      if (!target) return;
      stop(true); // Disconnect before our own scroll event; never retry over user scrolling.
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  };
  for (const event of events) win.addEventListener(event, cancel, { passive: true });
  win.addEventListener('keydown', onKey);
  if (typeof win.MutationObserver === 'function') {
    observer = new win.MutationObserver(attempt);
    observer.observe(doc.getElementById('root') || doc.body, { childList: true, subtree: true });
  }
  attempt();
  // React StrictMode cleanup can be followed by setup for the same initial entry.
  return () => stop(false);
}
