import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const analytics = readFileSync(new URL('../frontend/src/utils/analytics.js', import.meta.url), 'utf8');
const productEvents = readFileSync(new URL('../frontend/src/utils/analyticsEvents.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const bootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).find((script) => script.includes('bb-gtag-ready'));
const disabledKey = 'ga-disable-G-WRN4D234F2';
const initialTime = Date.parse('2026-10-04T12:00:00Z');

// Run the real helpers and inline bootstrap with local-only doubles: no network,
// browser, affiliate navigation, storage writes, or actual Google collection.
function harness({ hasWindow = true } = {}) {
  let now = initialTime;
  let nextTimer = 0;
  const timers = new Map();
  const listeners = new Map();
  const calls = [];
  const errors = [];
  const scripts = [];
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = {
    Date: TestDate,
    Event: class { constructor(type) { this.type = type; } },
    console: { debug() {}, log() {}, error(...args) { errors.push(args); } },
    setTimeout(fn, delay) {
      const id = ++nextTimer;
      timers.set(id, { fn, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    location: { pathname: '/plataformas', search: '?lang=en', href: 'https://example.test/plataformas?lang=en' },
    localStorage: { getItem() { return null; } },
    document: { head: { appendChild(script) { scripts.push(script); } }, createElement() { return {}; } },
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    dispatchEvent(event) { for (const fn of listeners.get(event.type) || []) fn(event); },
  };
  if (hasWindow) context.window = context;
  vm.createContext(context);
  vm.runInContext(
    analytics.replace(/export /g, '').replaceAll('import.meta.env', '({ DEV: false })') + '\n' +
    productEvents.replace(/^import .*;\s*$/gm, '').replace(/export /g, '') +
    '\nthis.api = { trackEvent, trackPageView, trackOfferViewed, trackReferralClicked };', context,
  );
  return {
    context, calls, errors, scripts, timers, api: context.api,
    ready() { context.dispatchEvent({ type: 'bb-gtag-ready' }); },
    installTracker() { context.gtag = (...args) => calls.push(args); },
    load() { vm.runInContext(bootstrap, context); context.dispatchEvent({ type: 'load' }); },
    tick(ms) {
      now += ms;
      for (const [id, timer] of timers) if (timer.at <= now) {
        timers.delete(id);
        timer.fn();
      }
    },
  };
}

const offer = { language: 'en', partner: 'fixture', offer_id: 'fixture_offer', intent: 'buy_usdt', placement: 'comparison', variant: 'benefit_v1' };
const referral = { ...offer, destination: 'https://example.test/offer', link_label: 'View offer' };

describe('bounded existing analytics bootstrap queue', () => {
  it('flushes pre-load page/impression/referral hits once through the unchanged real bootstrap', () => {
    const h = harness();
    h.api.trackPageView('/plataformas?lang=en', 'Platform comparison');
    h.api.trackOfferViewed(offer);
    h.api.trackReferralClicked(referral);
    assert.equal(h.context.gtag, undefined);
    assert.equal(h.context.dataLayer, undefined);
    assert.equal(h.scripts.length, 0);
    assert.equal(h.timers.size, 1);
    h.tick(1000);
    h.context.location = { pathname: '/elsewhere', search: '', href: 'https://example.test/elsewhere' };
    h.load();
    const events = Array.from(h.context.dataLayer).filter((args) => args[0] === 'event');
    assert.deepEqual(events.map((args) => args[1]), ['page_view', 'offer_viewed', 'referral_clicked', 'outbound_source_clicked']);
    assert.equal(events[0][2].page_location, 'https://example.test/plataformas?lang=en');
    for (const event of events.slice(1)) {
      assert.equal(event[2].event_timestamp, new Date(initialTime).toISOString());
      assert.equal(event[2].page_path, '/plataformas?lang=en');
      for (const [key, value] of Object.entries(offer)) assert.equal(event[2][key], value);
      for (const key of ['value', 'currency', 'revenue', 'qualified', 'signed_up']) assert.equal(key in event[2], false);
    }
    assert.equal(events[2][2].destination, referral.destination);
    assert.equal(events[3][2].destination, referral.destination);
    h.ready();
    assert.equal(h.context.dataLayer.length, 6);
    assert.equal(h.timers.size, 0);
    assert.equal(h.scripts.length, 1);
  });

  it('sends immediately when the existing tracker is available without replacing consent commands', () => {
    const h = harness();
    const consent = ['consent', 'default', { analytics_storage: 'denied' }];
    h.context.dataLayer = [consent];
    h.installTracker();
    const tracker = h.context.gtag;
    h.api.trackOfferViewed(offer);
    h.api.trackReferralClicked(referral);
    h.ready();
    h.ready();
    assert.deepEqual(h.calls.map((call) => call[1]), ['offer_viewed', 'referral_clicked', 'outbound_source_clicked']);
    assert.equal(h.context.gtag, tracker);
    assert.deepEqual(h.context.dataLayer, [consent]);
    assert.equal(h.timers.size, 0);
    assert.equal(h.scripts.length, 0);
  });

  it('drops unavailable hits at ready and never retries them on a later ready', () => {
    const h = harness();
    h.api.trackOfferViewed(offer);
    h.ready();
    h.api.trackReferralClicked(referral);
    assert.equal(h.timers.size, 0);
    h.installTracker();
    h.ready();
    assert.equal(h.calls.length, 0);
    h.api.trackReferralClicked(referral);
    assert.deepEqual(h.calls.map((call) => call[1]), ['referral_clicked', 'outbound_source_clicked']);
  });

  it('drops disabled hits before capture and does not replay them after re-enabling', () => {
    const h = harness();
    h.context[disabledKey] = true;
    h.api.trackPageView('/', 'Home');
    h.api.trackOfferViewed(offer);
    h.api.trackReferralClicked(referral);
    assert.equal(h.timers.size, 0);
    h.context[disabledKey] = false;
    h.installTracker();
    h.ready();
    assert.equal(h.calls.length, 0);
    h.context[disabledKey] = true;
    h.api.trackReferralClicked(referral);
    assert.equal(h.calls.length, 0);
  });

  it('discards pending hits if disabled before flush or a subsequent capture', () => {
    for (const captureWhileDisabled of [false, true]) {
      const h = harness();
      h.api.trackOfferViewed(offer);
      h.context[disabledKey] = true;
      if (captureWhileDisabled) {
        h.api.trackReferralClicked(referral);
        assert.equal(h.timers.size, 0);
        h.context[disabledKey] = false;
      }
      h.installTracker();
      h.ready();
      h.context[disabledKey] = false;
      h.ready();
      assert.equal(h.calls.length, 0);
      assert.equal(h.timers.size, 0);
    }
  });

  it('expires retained hits after 30 seconds with no delivery, persistence or retries', () => {
    const h = harness();
    h.api.trackOfferViewed(offer);
    h.tick(20000);
    h.api.trackReferralClicked(referral);
    h.tick(10000);
    assert.equal(h.timers.size, 1);
    h.installTracker();
    h.ready();
    assert.deepEqual(h.calls.map((call) => call[1]), ['referral_clicked', 'outbound_source_clicked']);
    assert.equal(h.timers.size, 0);
    const abandoned = harness();
    abandoned.api.trackOfferViewed(offer);
    abandoned.tick(30000);
    assert.equal(abandoned.timers.size, 0);
    abandoned.installTracker();
    abandoned.ready();
    assert.equal(abandoned.calls.length, 0);
  });

  it('bounds pending memory at 100 hits, preserving FIFO without creating overflow retries', () => {
    const h = harness();
    for (let index = 0; index < 110; index++) h.api.trackEvent('offer_viewed', { offer_id: `fixture_${index}` });
    assert.equal(h.timers.size, 1);
    h.installTracker();
    h.ready();
    assert.equal(h.calls.length, 100);
    assert.deepEqual(h.calls.map((call) => call[2].offer_id), Array.from({ length: 100 }, (_, index) => `fixture_${index}`));
    h.ready();
    assert.equal(h.calls.length, 100);
    assert.equal(h.timers.size, 0);
  });

  it('is safe without window and does not retry a throwing tracker', () => {
    const ssr = harness({ hasWindow: false });
    assert.doesNotThrow(() => {
      ssr.api.trackPageView('/', 'Home');
      ssr.api.trackOfferViewed(offer);
      ssr.api.trackReferralClicked(referral);
    });
    assert.equal(ssr.timers.size, 0);
    const h = harness();
    h.api.trackOfferViewed(offer);
    h.context.gtag = () => { throw new Error('blocked'); };
    assert.doesNotThrow(() => h.ready());
    assert.equal(h.errors.length, 1);
    h.installTracker();
    h.ready();
    assert.equal(h.calls.length, 0);
  });
});
