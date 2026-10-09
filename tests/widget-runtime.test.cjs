const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../frontend/public/embed.js'), 'utf8');
const NOW = Date.parse('2026-10-09T12:00:00Z');
const MINUTE = 60_000;
const quote = (overrides = {}) => ({ buy_bob_per_usd: 9.12, sell_bob_per_usd: 9.34, updated_at_iso: '2026-10-09T11:55:00Z', generated_at_iso: '2026-10-09T12:00:00Z', is_stale: false, ...overrides });
const flush = () => new Promise(setImmediate);

// Minimal DOM/timer contract for the standalone runtime. Playwright owns actual
// layout, browser behavior, iframe integration, and React/SPA rendering checks.
function harness(options = {}) {
  let now = NOW;
  let nextTimer = 0;
  const timers = new Map();
  const targets = new Map();
  const observers = new Set();
  const windowEvents = new Map();
  const documentEvents = new Map();
  const calls = [];
  function events(store) {
    return {
      addEventListener(type, callback, options) {
        if (!store.has(type)) store.set(type, new Map());
        store.get(type).set(callback, options);
      },
      removeEventListener(type, callback) { store.get(type)?.delete(callback); },
    };
  }
  function dispatch(store, type, event = {}) {
    for (const [callback, options] of [...(store.get(type) || [])]) {
      if (options?.once) store.get(type).delete(callback);
      callback(event);
    }
  }
  function target(id) {
    const el = { id, isConnected: true, innerHTML: '' };
    targets.set(id, el);
    return el;
  }
  const document = {
    ...events(documentEvents), hidden: false, documentElement: {},
    getElementById: (id) => targets.get(id),
    createElement: () => ({ isConnected: true, innerHTML: '' }),
  };
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  function schedule(callback, delay, repeat) {
    const id = ++nextTimer;
    timers.set(id, { callback, at: now + delay, repeat });
    return id;
  }
  const context = {
    document, Date: FakeDate, Intl, Map, Promise, Number, String, Boolean, Error, AbortController,
    setTimeout: (callback, delay) => schedule(callback, delay, 0),
    clearTimeout: (id) => timers.delete(id),
    setInterval: (callback, delay) => schedule(callback, delay, delay),
    clearInterval: (id) => timers.delete(id),
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { observers.add(this.callback); }
      disconnect() { observers.delete(this.callback); }
    },
    fetch: (url, init) => new Promise((resolve, reject) => {
      const call = { url, init, resolve, reject, aborted: false };
      init.signal.addEventListener('abort', () => {
        call.aborted = true;
        reject(new Error('AbortError'));
      });
      calls.push(call);
    }),
    ...events(windowEvents),
  };
  context.window = context;
  vm.createContext(context);
  function load(id = 'first', attrs = {}) {
    const el = targets.get(id) || target(id);
    document.currentScript = {
      isConnected: true,
      getAttribute: (name) => ({ 'data-target': id, ...attrs })[name] || null,
      parentNode: { insertBefore: (node) => targets.set(node.id, node) },
    };
    vm.runInContext(source, context);
    return el;
  }
  const first = load('first', options);
  return {
    first, calls, targets, context, load,
    mount(id, options = {}) { const el = targets.get(id) || target(id); context.BoliviaBlueWidget.mount(el, options); return el; },
    unmount(el) { context.BoliviaBlueWidget.unmount(el); },
    remove(el) { el.isConnected = false; targets.delete(el.id); for (const callback of [...observers]) callback(); },
    event(type, event) { dispatch(windowEvents, type, event); },
    visibility(hidden) { document.hidden = hidden; dispatch(documentEvents, 'visibilitychange'); },
    intervals: () => [...timers.values()].filter((timer) => timer.repeat).length,
    observers: () => observers.size,
    async respond(index = calls.length - 1, body = quote(), status = 200) {
      calls[index].resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
      await flush();
    },
    async advance(duration) {
      const end = now + duration;
      while (true) {
        const pending = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!pending) break;
        const [id, timer] = pending;
        now = timer.at;
        if (timer.repeat) timer.at += timer.repeat;
        else timers.delete(id);
        timer.callback();
        await flush();
      }
      now = end;
      await flush();
    },
  };
}
function status(el, expected) { assert.match(el.innerHTML, new RegExp(`data-bb-status="${expected}"`)); }
function value(el, side, expected) { assert.match(el.innerHTML, new RegExp(`data-bb-${side}[^>]*>${expected.replace('.', '\\.')}<`)); }
function time(el) { return el.innerHTML.match(/data-bb-time[^>]*>([^<]*)</)[1]; }

test('fresh observations have accurate reference, labels, Bolivia time, and no LIVE claim', async () => {
  const h = harness();
  status(h.first, 'loading');
  await h.respond();
  status(h.first, 'fresh');
  value(h.first, 'buy', '9.12');
  value(h.first, 'sell', '9.34');
  for (const text of ['P2P USDT/BOB', 'BOB por USDT', 'Lectura reciente', 'Bolivia, UTC−4', 'no es dólar en efectivo', 'utm_medium=widget']) assert.ok(h.first.innerHTML.includes(text));
  assert.match(time(h.first), /0?7:55/);
  assert.doesNotMatch(h.first.innerHTML, /\bLIVE\b|08:00/);
  assert.equal(h.calls[0].init.credentials, 'omit');
});

test('age and explicit API staleness each override recency', async (t) => {
  for (const overrides of [{ updated_at_iso: '2026-10-09T11:39:59Z' }, { is_stale: true }]) {
    await t.test(JSON.stringify(overrides), async () => {
      const h = harness();
      await h.respond(0, quote(overrides));
      status(h.first, 'stale');
      assert.match(h.first.innerHTML, /Lectura desactualizada/);
    });
  }
});

test('invalid time/rates never create a verified observation', async (t) => {
  const cases = [
    { updated_at_iso: null }, { updated_at_iso: 'bad' },
    { updated_at_iso: '2026-10-09T11:55:00' }, { updated_at_iso: '2026-02-30T11:55:00Z' },
    { updated_at_iso: '2026-10-09T12:01:00Z' }, { buy_bob_per_usd: null },
    { buy_bob_per_usd: 0 }, { buy_bob_per_usd: -1 }, { buy_bob_per_usd: NaN },
    { sell_bob_per_usd: Infinity }, { sell_bob_per_usd: '9.34' },
  ];
  for (const overrides of cases) await t.test(JSON.stringify(overrides), async () => {
    const h = harness();
    await h.respond(0, quote(overrides));
    status(h.first, 'unknown');
    assert.match(h.first.innerHTML, /Lectura sin verificar/);
    assert.doesNotMatch(h.first.innerHTML, /NaN|Infinity|Invalid Date|\bLIVE\b/);
  });
});

test('failed initial request recovers on the next one-minute poll', async () => {
  const h = harness();
  await h.respond(0, {}, 503);
  status(h.first, 'error');
  assert.match(h.first.innerHTML, /No se pudo cargar/);
  await h.advance(MINUTE);
  assert.equal(h.calls.length, 2);
  await h.respond(1);
  status(h.first, 'fresh');
});

test('failed and malformed refreshes retain valid values and observation time', async (t) => {
  for (const [body, responseStatus] of [[{}, 503], [quote({ buy_bob_per_usd: null }), 200], [quote({ updated_at_iso: 'bad' }), 200]]) await t.test(`${responseStatus} ${JSON.stringify(body)}`, async () => {
    const h = harness();
    await h.respond();
    const originalTime = time(h.first);
    await h.advance(MINUTE);
    await h.respond(1, body, responseStatus);
    status(h.first, 'error');
    value(h.first, 'buy', '9.12');
    value(h.first, 'sell', '9.34');
    assert.equal(time(h.first), originalTime);
    assert.match(h.first.innerHTML, /Falló actualización · última lectura/);
    await h.advance(MINUTE);
    await h.respond(2, quote({ buy_bob_per_usd: 9.56, updated_at_iso: '2026-10-09T12:01:00Z' }));
    status(h.first, 'fresh');
    value(h.first, 'buy', '9.56');
    assert.match(time(h.first), /0?8:01/);
  });
});

test('local aging marks stale before the next fetch and stale errors remain explicit', async () => {
  const h = harness();
  await h.respond(0, quote({ updated_at_iso: '2026-10-09T11:40:15Z' }));
  status(h.first, 'fresh');
  await h.advance(30_000);
  status(h.first, 'stale');
  assert.equal(h.calls.length, 1);
  await h.advance(30_000);
  await h.respond(1, {}, 503);
  status(h.first, 'stale');
  assert.match(h.first.innerHTML, /Lectura desactualizada · falló actualización/);
});

test('repeated scripts and mounts share fetches and one global interval', async () => {
  const h = harness();
  const second = h.load('second', { 'data-lang': 'en', 'data-theme': 'dark' });
  for (let i = 0; i < 5; i += 1) h.mount('first');
  assert.equal(h.calls.length, 1);
  assert.equal(h.intervals(), 1);
  await h.respond();
  status(second, 'fresh');
  assert.match(second.innerHTML, /BOB per USDT|Recent observation/);
  assert.match(second.innerHTML, /background:#111827/);
  await h.advance(MINUTE);
  h.mount('third');
  assert.equal(h.calls.length, 2);
  await h.respond(1, quote({ buy_bob_per_usd: 9.56 }));
  for (const el of h.targets.values()) value(el, 'buy', '9.56');
});

test('per-API sessions stay independent and changing an API cancels its old request', async () => {
  const h = harness({ 'data-api': '/api/first' });
  const second = h.mount('second', { api: '/api/second', lang: 'en' });
  assert.deepEqual(h.calls.map((call) => call.url), ['/api/first', '/api/second']);
  await h.respond(0, quote({ buy_bob_per_usd: 10.12 }));
  await h.respond(1, quote({ buy_bob_per_usd: 11.12 }));
  value(h.first, 'buy', '10.12');
  value(second, 'buy', '11.12');
  await h.advance(MINUTE);
  h.mount('first', { api: '/api/third' });
  assert.equal(h.calls[2].aborted, true);
  assert.equal(h.calls[3].aborted, false);
  assert.equal(h.calls[4].url, '/api/third');
});

test('timeout ends a hung fetch after ten seconds and retries after sixty', async () => {
  const h = harness();
  await h.advance(9_999);
  status(h.first, 'loading');
  await h.advance(1);
  assert.equal(h.calls[0].aborted, true);
  status(h.first, 'error');
  await h.advance(49_999);
  assert.equal(h.calls.length, 1);
  await h.advance(1);
  assert.equal(h.calls.length, 2);
  await h.respond(1);
  status(h.first, 'fresh');
});

test('detached widgets and explicit unmount release only unused sessions', async () => {
  const h = harness();
  const second = h.mount('second');
  await h.respond();
  h.remove(h.first);
  await h.advance(MINUTE);
  assert.equal(h.calls.length, 2);
  h.unmount(second);
  assert.equal(h.calls[1].aborted, true);
  assert.equal(h.intervals(), 0);
  assert.equal(h.observers(), 0);
  await h.advance(3 * MINUTE);
  assert.equal(h.calls.length, 2);
  const replacement = h.mount('replacement');
  assert.equal(h.calls.length, 3);
  await h.respond(2);
  status(replacement, 'fresh');
  assert.equal(h.intervals(), 1);
});

test('hidden pages pause polling and refresh when visible again', async () => {
  const h = harness();
  await h.respond();
  h.visibility(true);
  await h.advance(3 * MINUTE);
  assert.equal(h.calls.length, 1);
  h.visibility(false);
  assert.equal(h.calls.length, 2);
  await h.respond(1);
  status(h.first, 'fresh');
});

test('pagehide cleans up; persisted pageshow restarts an aborted initial fetch immediately', async (t) => {
  for (const persisted of [false, true]) await t.test(`persisted=${persisted}`, async () => {
    const h = harness();
    h.event('pagehide', { persisted });
    assert.equal(h.calls[0].aborted, true);
    assert.equal(h.intervals(), 0);
    assert.equal(h.observers(), 0);
    await h.advance(1_000);
    h.event('pageshow', { persisted });
    assert.equal(h.calls.length, persisted ? 2 : 1);
    if (persisted) {
      await h.respond(1);
      status(h.first, 'fresh');
      assert.equal(h.intervals(), 1);
      h.event('pageshow', { persisted });
      assert.equal(h.intervals(), 1);
      assert.equal(h.calls.length, 2);
    }
  });
});

test('a removed async script cannot create an orphan widget', () => {
  const h = harness();
  h.unmount(h.first);
  h.context.document.currentScript = { isConnected: false };
  vm.runInContext(source, h.context);
  assert.equal(h.intervals(), 0);
  assert.equal(h.calls.length, 1);
});
