import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { isPaymentCostGuide, waitForPaymentCostAnchor } from '../frontend/src/utils/paymentCostAnchor.js';

function browser(path = '/guia-dinero-bolivia#payment-cost-comparison') {
  const listeners = new Map();
  const frames = new Map();
  const observers = [];
  const scrolls = [];
  let target;
  let serial = 0;
  let settled = 0;
  const root = {};
  const win = {
    location: new URL(path, 'https://www.boliviablue.com'), scrollY: 0,
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    requestAnimationFrame(callback) { const id = ++serial; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
      observe(node, options) { assert.equal(node, root); assert.deepEqual(options, { childList: true, subtree: true }); this.active = true; }
      disconnect() { this.active = false; }
    },
  };
  const doc = { body: root, getElementById(id) { return id === 'root' ? root : id === 'payment-cost-comparison' ? target : null; } };
  return {
    win, doc, frames, observers, scrolls,
    get settled() { return settled; },
    begin() { return waitForPaymentCostAnchor(() => { settled++; }, win, doc); },
    mount() { target = { scrollIntoView(options) { scrolls.push(options); } }; for (const o of observers) if (o.active) o.callback([]); },
    unmount() { target = null; },
    event(type, props = {}) { for (const callback of listeners.get(type) || []) callback(props); },
    frame() { const work = [...frames.values()]; frames.clear(); for (const callback of work) callback(); },
    activeListeners() { return [...listeners.values()].reduce((total, items) => total + items.size, 0); },
  };
}

describe('initial lazy payment checker anchor', () => {
  it('waits for either guide to mount then scrolls once using its CSS scroll margin', () => {
    for (const path of ['/guia-dinero-bolivia', '/bolivia-money-guide']) {
      const h = browser(`${path}#payment-cost-comparison`);
      h.begin();
      assert.equal(h.scrolls.length, 0);
      assert.equal(h.frames.size, 0); // No arbitrary 100ms retry deadline.
      h.mount();
      assert.equal(h.frames.size, 1);
      h.mount();
      assert.equal(h.frames.size, 1);
      h.frame();
      assert.deepEqual(h.scrolls, [{ behavior: 'auto', block: 'start' }]);
      assert.equal(h.settled, 1);
      assert.equal(h.activeListeners(), 0);
      assert.ok(h.observers.every((o) => !o.active));
      h.mount(); h.frame();
      assert.equal(h.scrolls.length, 1);
    }
  });
  it('does not target unrelated routes/hashes or alter navigation history', () => {
    for (const path of ['/plataformas#payment-cost-comparison', '/guia-dinero-bolivia#cajeros', '/bolivia-money-guide', '/#payment-cost-comparison']) {
      const h = browser(path);
      assert.equal(isPaymentCostGuide(h.win.location), false);
      h.begin(); h.mount(); h.frame();
      assert.equal(h.scrolls.length, 0);
      assert.equal(h.activeListeners(), 0);
      assert.equal(h.observers.length, 0);
    }
    const h = browser(); const before = h.win.location.href;
    h.begin(); h.mount(); h.frame();
    assert.equal(h.win.location.href, before);
    assert.doesNotThrow(() => waitForPaymentCostAnchor(null, null, null)());
  });
  it('cancels for user gestures or scroll restoration before mount and before the frame', () => {
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'scroll', 'popstate', 'hashchange']) for (const mountFirst of [false, true]) {
      const h = browser(); h.begin(); if (mountFirst) h.mount();
      h.event(type); h.mount(); h.frame();
      assert.equal(h.scrolls.length, 0, `${type} ${mountFirst}`);
      assert.equal(h.settled, 1);
      assert.equal(h.activeListeners(), 0);
      assert.equal(h.frames.size, 0);
    }
    for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab']) {
      const h = browser(); h.begin(); h.event('keydown', { key }); h.mount(); h.frame();
      assert.equal(h.scrolls.length, 0, key);
    }
    for (const restoreBefore of [false, true]) {
      const h = browser(); if (restoreBefore) h.win.scrollY = 200;
      h.begin(); h.mount(); h.win.scrollY = 200; h.frame();
      assert.equal(h.scrolls.length, 0);
      assert.equal(h.settled, 1);
    }
  });
  it('rechecks URL/element at the frame and supports StrictMode cleanup/setup', () => {
    for (const next of ['/bolivia-money-guide#payment-cost-comparison', '/guia-dinero-bolivia#cajeros', '/guia-dinero-bolivia?lang=en#payment-cost-comparison']) {
      const h = browser(); h.begin(); h.mount(); h.win.location = new URL(next, h.win.location); h.frame();
      assert.equal(h.scrolls.length, 0);
      assert.equal(h.settled, 1);
    }
    const h = browser(); const cleanup = h.begin(); h.mount(); cleanup(); h.frame();
    assert.equal(h.scrolls.length, 0);
    assert.equal(h.settled, 0); // Effect replay may register again for the same initial entry.
    h.unmount(); h.begin(); h.mount(); h.frame();
    assert.equal(h.scrolls.length, 1);
    assert.equal(h.settled, 1);
  });
});

describe('page hook scopes readiness to the initial payment hash', () => {
  it('does not restart after success, user cancellation, later navigation or Back', () => {
    const source = readFileSync(new URL('../frontend/src/hooks/usePageTracking.js', import.meta.url), 'utf8');
    const stripped = source.replace(/^import .*;\s*$/gm, '').replace('export function', 'function');
    const initial = { key: 'default', pathname: '/guia-dinero-bolivia', search: '', hash: '#payment-cost-comparison' };
    const refs = []; let refIndex = 0; let effects = []; let callback; let waits = 0; let stops = 0; let views = 0;
    const context = {
      useLocation: () => context.location, useLanguage: () => ({ language: 'es' }),
      useRef: (value) => { const i = refIndex++; if (!refs[i]) refs[i] = { current: value }; return refs[i]; },
      useEffect: (fn) => { effects.push(fn); },
      isPaymentCostGuide, waitForPaymentCostAnchor: (done) => { waits++; callback = done; return () => { stops++; }; },
      trackPageView: () => { views++; }, initScrollDepthTracking: () => () => {}, initTimeOnPageTracking: () => () => {},
      analyticsTitleForPath: () => 'Money guide', sanitizeLangSearch: (value) => value, analyticsPageLocation: () => 'https://www.boliviablue.com/guia-dinero-bolivia',
      window: { location: { origin: 'https://www.boliviablue.com' }, setTimeout() {}, clearTimeout() {}, scrollTo() {} },
      document: { getElementById: () => null, documentElement: {}, body: {} }, location: initial,
    };
    vm.runInNewContext(stripped + '\nthis.hook = usePageTracking;', context);
    const render = (location) => { context.location = location; refIndex = 0; effects = []; context.hook(); const cleanups = effects.map((fn) => fn()); return () => cleanups.forEach((cleanup) => cleanup?.()); };
    const firstCleanup = render(initial);
    firstCleanup();
    const replayCleanup = render(initial);
    assert.equal(waits, 2);
    assert.equal(views, 1);
    callback(); replayCleanup();
    render(initial)();
    assert.equal(waits, 2);
    render({ key: 'next', pathname: '/calculadora', search: '', hash: '' })();
    render(initial)();
    assert.equal(waits, 2);
    assert.ok(stops >= 2);
    assert.equal(views, 3);
  });
});
