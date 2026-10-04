import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { headerRateSnapshot, reservedBottomSpace } from '../frontend/src/utils/headerRate.js';
const source = (path) => readFileSync(new URL(`../frontend/src/${path}`, import.meta.url), 'utf8');
const now = Date.parse('2026-10-03T12:00:00Z');
const rate = { buy_bob_per_usd: 12.01, sell_bob_per_usd: 11.97, updated_at_iso: '2026-10-03T11:58:00Z' };

describe('sticky header rates', () => {
  it('displays the shared USD observation unchanged, including spread direction', () => {
    const quote = headerRateSnapshot(rate, 'USD', { now });
    assert.equal(quote.buy, 12.01);
    assert.equal(quote.sell, 11.97);
    assert.equal(quote.currency, 'USD');
    assert.equal(quote.stale, false);
    assert.equal(quote.path, '/dolar-blue-hoy');
  });
  it('keeps selected-currency units and never falls back to USD values for missing fiat', () => {
    const row = { ...rate, buy_bob_per_cop: 0.00321, sell_bob_per_cop: 0.00345, buy_bob_per_brl: 2.345, sell_bob_per_brl: 2.456 };
    const cop = headerRateSnapshot(row, 'COP', { now });
    assert.equal(cop.buy, 0.00321);
    assert.equal(cop.sell, 0.00345);
    assert.equal(cop.currency, 'COP');
    assert.equal(headerRateSnapshot(row, 'BRL', { now }).buy, 2.345);
    assert.equal(headerRateSnapshot(row, 'EUR', { now }).available, false);
    assert.equal(headerRateSnapshot(row, 'EUR', { now }).buy, null);
  });
  it('marks old snapshots, fallback errors and old currency timestamps as stale', () => {
    assert.equal(headerRateSnapshot({ ...rate, updated_at_iso: '2026-10-03T11:00:00Z' }, 'USD', { now }).stale, true);
    assert.equal(headerRateSnapshot(rate, 'USD', { now, error: true }).stale, true);
    assert.equal(headerRateSnapshot({ ...rate, buy_bob_per_eur: 14, sell_bob_per_eur: 15, eur_updated_at_iso: '2026-10-03T10:00:00Z' }, 'EUR', { now }).stale, true);
    assert.equal(headerRateSnapshot({ ...rate, is_stale: true }, 'USD', { now }).stale, true);
    assert.equal(headerRateSnapshot(null, 'USD', { now }).available, false);
  });
  it('uses shared data without a new rate request or polling timer', () => {
    const component = source('components/HeaderRates.jsx');
    assert.match(component, /useOptionalRate/);
    assert.doesNotMatch(component, /fetch\(|fetchBlueRate|setInterval|setTimeout/);
    assert.match(component, /Bs\/\{quote.currency\}/);
    assert.match(component, /flex-wrap/);
    assert.match(source('components/Navigation.jsx'), /--bb-header-height/);
    assert.doesNotMatch(source('components/Navigation.jsx'), /top-\[57px\]/);
  });
});

describe('publisher layout and supported anchors', () => {
  it('keeps Binance invitation and existing-account P2P destinations distinct', () => {
    const board = source('components/PlatformRatesBoard.jsx');
    const binance = board.slice(board.indexOf('  binance: {'), board.indexOf('\n  },', board.indexOf('  binance: {')));
    assert.match(binance, /href: BINANCE_REFERRAL_LINK/);
    assert.match(binance, /View invitation/);
    assert.match(binance, /secondaryHref: 'https:\/\/p2p\.binance\.com'/);
    assert.match(binance, /Existing account: P2P/);
    assert.match(board, /href=\{meta.secondaryHref \|\| meta.href\}/);
    assert.match(board, /platform_board_existing_/);
  });
  it('reads reserved bottom space without inventing a fixed ad height', () => {
    assert.equal(reservedBottomSpace('154px'), 154);
    assert.equal(reservedBottomSpace('0px'), 0);
    assert.equal(reservedBottomSpace('auto'), 0);
    assert.equal(reservedBottomSpace('-20px'), 0);
    const hook = source('hooks/useAdReservedSpace.js');
    assert.doesNotMatch(hook, /body\.style\.|adsbygoogle|iframe|\.remove\(/);
    assert.match(hook, /observer\.disconnect/);
    for (const file of ['components/MobileBottomNav.jsx', 'components/RateAlertFab.jsx', 'pages/BuyDollars.jsx']) assert.match(source(file), /--bb-ad-reserved-bottom/);
  });
  it('does not override Google-managed ad geometry or the owner’s anchor settings', () => {
    const css = source('index.css').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(css, /adsbygoogle|google_ads_iframe|google-vignette/);
    const loader = source('utils/adsenseLoader.js');
    assert.doesNotMatch(loader, /setAttribute\(['"]data-overlays/);
    assert.match(loader, /dashboard settings/);
  });
  it('loads ordinary Auto ads once without re-enabling anchors', () => {
    const loaded = [];
    const context = {
      console: { log() {}, warn() {}, error() {} },
      window: { location: { pathname: '/comprar-dolares' } },
      document: {
        querySelector: () => loaded[0] || null,
        querySelectorAll: () => [],
        body: { getAttribute: () => 'true' },
        createElement: () => ({ attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } }),
        head: { appendChild(script) { loaded.push({ ...script, attributes: { ...script.attributes } }); } },
      },
    };
    const code = source('utils/adsenseLoader.js').replace(/export function /g, 'function ');
    vm.runInNewContext(code + "\nloadAdSense('ca-pub-3497294777171749'); loadAdSense('ca-pub-3497294777171749');", context);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].src, 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3497294777171749');
    assert.equal(loaded[0].async, true);
    assert.equal(loaded[0].crossOrigin, 'anonymous');
    assert.equal(loaded[0].attributes['data-ad-client'], 'ca-pub-3497294777171749');
    assert.equal(loaded[0].attributes['data-auto-ads'], 'true');
    assert.equal(loaded[0].attributes['data-overlays'], undefined);
  });
});
