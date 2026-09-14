/**
 * Focused unit tests for homepage live-SEO HTML transforms (no Edge runtime required).
 * Run: node --test middleware.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import middleware, {
  fmt,
  normalizeRates,
  escapeAttr,
  escapeHtml,
  metaForPath,
  replaceMeta,
  injectHomeShellRates,
  applyLiveSeo,
  applyEnglishAnnotations,
  withLangQuery,
  replaceAllRatePairs,
  fillLiveRateSlots,
  shouldTransformPath,
  wantsHtmlDocument,
} from './middleware.js';

const SHELL_FIXTURE = `<!DOCTYPE html><html><head>
<title>Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min</title>
<meta name="title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="description" content="Dólar blue Bolivia hoy: compra y venta actualizadas cada 15 min desde Binance P2P." />
<meta property="og:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta property="og:description" content="Dólar blue Bolivia hoy: compra y venta actualizadas cada 15 min desde Binance P2P." />
<meta name="twitter:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="twitter:description" content="Dólar blue Bolivia hoy: compra y venta actualizadas cada 15 min." />
</head><body>
<div id="root"><main class="max-w-7xl mx-auto px-4 py-8" data-seo-shell="home">
<div class="text-center space-y-4 mb-8">
<h1 class="text-3xl sm:text-5xl font-bold text-gray-900">Dólar Blue Bolivia – Cotización en Tiempo Real y Herramientas</h1>
<p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Tu fuente principal para el dólar blue en Bolivia: cotización cada 15 min, gráficos históricos, calculadora y noticias. Sin registro.</p>
<nav class="flex flex-wrap justify-center gap-3 mt-4" aria-label="Enlaces principales">
<a href="/dolar-blue-hoy" class="text-blue-600 font-medium">Dólar blue hoy</a>
<a href="/calculadora" class="text-blue-600 font-medium">Calculadora</a>
</nav>
</div>
</main></div>
</body></html>`;

describe('normalizeRates', () => {
  it('accepts buy_bob_per_usd / sell_bob_per_usd from /api/blue-rate', () => {
    const rates = normalizeRates({
      buy_bob_per_usd: 12.345,
      sell_bob_per_usd: 12.678,
      updated_at_iso: '2026-08-01T20:00:00.000Z',
    });
    assert.equal(rates.buy, '12.35');
    assert.equal(rates.sell, '12.68');
    assert.equal(rates.updatedAt, '2026-08-01T20:00:00.000Z');
    assert.equal(rates.buyEur, null);
    assert.equal(rates.sellEur, null);
  });

  it('accepts buy / sell aliases', () => {
    const rates = normalizeRates({ buy: 10, sell: 11 });
    assert.equal(rates.buy, '10.00');
    assert.equal(rates.sell, '11.00');
    assert.equal(rates.updatedAt, null);
  });

  it('rejects missing, nonnumeric, or NaN rates', () => {
    assert.equal(normalizeRates(null), null);
    assert.equal(normalizeRates({}), null);
    assert.equal(normalizeRates({ buy_bob_per_usd: 'x', sell_bob_per_usd: 1 }), null);
    assert.equal(normalizeRates({ buy: NaN, sell: 1 }), null);
    assert.equal(normalizeRates({ buy: 1, sell: undefined }), null);
  });

  it('drops invalid updated_at_iso but keeps rates', () => {
    const rates = normalizeRates({
      buy: 10.5,
      sell: 10.6,
      updated_at_iso: 'not-a-date',
    });
    assert.equal(rates.buy, '10.50');
    assert.equal(rates.updatedAt, null);
  });
});

describe('fmt', () => {
  it('matches UI two-decimal rounding for USD', () => {
    assert.equal(fmt(12.345), '12.35');
    assert.equal(fmt('9'), '9.00');
    assert.equal(fmt(undefined), null);
    assert.equal(fmt(0), null);
    assert.equal(fmt(0.00), null);
    assert.equal(fmt('0.00'), null);
    assert.equal(normalizeRates({ buy: 0, sell: 0 }), null);
    assert.equal(normalizeRates({ buy_bob_per_usd: 0, sell_bob_per_usd: 11 }), null);
  });
});

describe('escaping', () => {
  it('escapes attribute and HTML special characters', () => {
    assert.equal(escapeAttr('a"b<c&'), 'a&quot;b&lt;c&amp;');
    assert.equal(escapeHtml('a>b<c&"d'), 'a&gt;b&lt;c&amp;&quot;d');
  });

  it('replaceMeta escapes quotes in titles so attributes stay intact', () => {
    const html = replaceMeta(
      SHELL_FIXTURE,
      'Title with "quotes" & <tags>',
      'Desc with "quotes"'
    );
    assert.match(html, /content="Title with &quot;quotes&quot; &amp; &lt;tags&gt;"/);
    assert.doesNotMatch(html, /content="Title with "quotes"/);
  });
});

describe('homepage shell injection', () => {
  it('injects visible buy/sell into data-seo-shell paragraph', () => {
    const out = injectHomeShellRates(SHELL_FIXTURE, '12.35', '12.68', '2026-08-01T20:00:00.000Z');
    assert.match(out, /data-seo-shell="home"/);
    assert.match(out, /compra Bs 12\.35 y venta Bs 12\.68/);
    assert.match(out, /Referencia P2P|mercado paralelo|USDT/);
    assert.match(out, /Última lectura:/);
    assert.match(out, /href="\/dolar-blue-hoy"/);
    assert.match(out, /id="root"/);
    assert.equal((out.match(/<h1\b/gi) || []).length, 1);
    assert.doesNotMatch(out, /Tu fuente principal/);
    assert.doesNotMatch(out, /display:\s*none|hidden|aria-hidden="true"/i);
  });

  it('omits timestamp when updatedAt is null', () => {
    const out = injectHomeShellRates(SHELL_FIXTURE, '10.00', '10.10', null);
    assert.match(out, /compra Bs 10\.00 y venta Bs 10\.10/);
    assert.doesNotMatch(out, /Última lectura:/);
  });
});

describe('applyLiveSeo', () => {
  it('keeps title, description, and shell values consistent', () => {
    const rates = normalizeRates({
      buy_bob_per_usd: 12.34,
      sell_bob_per_usd: 12.56,
      updated_at_iso: '2026-08-01T15:30:00.000Z',
    });
    const applied = applyLiveSeo(SHELL_FIXTURE, '/', rates);
    assert.ok(applied?.live);
    const { html } = applied;
    const meta = metaForPath('/', rates.buy, rates.sell);
    assert.match(html, new RegExp(`<title>${meta.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
    assert.match(html, /compra Bs 12\.34 y venta Bs 12\.56/);
    assert.match(html, new RegExp(`og:title" content="${meta.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.match(html, /twitter:description" content="Bolivia Blue:/);
  });

  it('returns null when rates are missing (caller must keep original shell)', () => {
    assert.equal(applyLiveSeo(SHELL_FIXTURE, '/', null), null);
  });
});

describe('request gating helpers', () => {
  it('transforms homepage for every UA; other routes only for bots', () => {
    assert.equal(shouldTransformPath('/', 'Mozilla/5.0'), true);
    assert.equal(shouldTransformPath('/', 'Googlebot'), true);
    assert.equal(shouldTransformPath('/dolar-blue-hoy', 'Mozilla/5.0'), false);
    assert.equal(shouldTransformPath('/dolar-blue-hoy', 'Googlebot'), true);
    assert.equal(shouldTransformPath('/dolar-blue-hoy', 'bingbot'), true);
  });

  it('skips non-HTML Accept headers', () => {
    assert.equal(
      wantsHtmlDocument({ headers: { get: () => 'application/json' } }),
      false
    );
    assert.equal(
      wantsHtmlDocument({ headers: { get: () => 'text/html,application/xhtml+xml' } }),
      true
    );
    assert.equal(wantsHtmlDocument({ headers: { get: () => null } }), true);
  });
});

describe('GET vs HEAD homepage handling', () => {
  const originalFetch = globalThis.fetch;

  function mockFetch() {
    const calls = [];
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes('/api/blue-rate')) {
        return {
          ok: true,
          async json() {
            return {
              buy_bob_per_usd: 12.34,
              sell_bob_per_usd: 12.56,
              updated_at_iso: '2026-08-01T20:00:00.000Z',
            };
          },
        };
      }
      return {
        ok: true,
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        async text() {
          return SHELL_FIXTURE;
        },
      };
    };
    return calls;
  }

  function makeRequest(method) {
    return {
      method,
      url: 'https://boliviablue.com/',
      headers: {
        get(name) {
          const key = String(name).toLowerCase();
          if (key === 'user-agent') return 'Mozilla/5.0';
          if (key === 'accept') return 'text/html';
          if (key === 'x-bb-skip-live-seo') return null;
          return null;
        },
      },
    };
  }

  it('GET / still performs live injection', async () => {
    const calls = mockFetch();
    try {
      const res = await middleware(makeRequest('GET'));
      assert.ok(res instanceof Response);
      assert.equal(res.headers.get('x-bb-live-seo'), '1');
      const body = await res.text();
      assert.match(body, /compra Bs 12\.34 y venta Bs 12\.56/);
      assert.equal(calls.filter((c) => c.url.includes('/api/blue-rate')).length, 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('HEAD / does not request the rate API or return transformed HTML', async () => {
    const calls = mockFetch();
    try {
      const res = await middleware(makeRequest('HEAD'));
      assert.equal(res, undefined);
      assert.equal(calls.length, 0);
      assert.equal(calls.filter((c) => c.url.includes('/api/blue-rate')).length, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('single snapshot', () => {
  it('rewrites every compra/venta pair to the same live numbers', () => {
    const html = `<p>compra Bs 12.05 y venta Bs 12.02.</p><p>compra Bs 12.48 · venta Bs 12.44</p>`;
    const out = replaceAllRatePairs(html, '12.48', '12.44');
    assert.equal((out.match(/12\.05/g) || []).length, 0);
    assert.equal((out.match(/12\.02/g) || []).length, 0);
    assert.match(out, /compra Bs 12\.48 y venta Bs 12\.44/);
    assert.match(out, /compra Bs 12\.48 · venta Bs 12\.44/);
  });

  it('does not put USD rates on the peso page when COP is missing', () => {
    const rates = normalizeRates({
      buy_bob_per_usd: 12.48,
      sell_bob_per_usd: 12.44,
      updated_at_iso: '2026-09-07T19:00:00.000Z',
    });
    assert.equal(applyLiveSeo('<html></html>', '/peso-a-boliviano', rates), null);
  });

  it('uses 1.000 COP in Bs on the peso path, not the per-peso rate', () => {
    const html = `<html><head><title>x</title><meta name="description" content="d" /><meta property="og:title" content="x" /><meta property="og:description" content="d" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="d" /></head><body><p>compra Bs 0.00 · venta Bs 0.00</p></body></html>`;
    const rates = normalizeRates({
      buy_bob_per_usd: 12.48,
      sell_bob_per_usd: 12.44,
      buy_bob_per_cop: 0.00375,
      sell_bob_per_cop: 0.00372,
      updated_at_iso: '2026-09-14T19:00:00.000Z',
    });
    const applied = applyLiveSeo(html, '/peso-a-boliviano', rates);
    assert.ok(applied?.live);
    assert.match(applied.html, /1\.000 COP ≈ 3\.75 \/ 3\.72 Bs/);
    assert.doesNotMatch(applied.html, /Compra 12\.48/);
  });

  it('does not put USD rates on the euro page when EUR is missing', () => {
    const rates = normalizeRates({
      buy_bob_per_usd: 12.48,
      sell_bob_per_usd: 12.44,
      updated_at_iso: '2026-09-07T19:00:00.000Z',
    });
    assert.equal(applyLiveSeo('<html></html>', '/euro-a-boliviano', rates), null);
  });

  it('uses EUR fields on the euro path', () => {
    const html = `<html><head><title>x</title><meta name="description" content="d" /><meta property="og:title" content="x" /><meta property="og:description" content="d" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="d" /></head><body><p>compra Bs 0.00 · venta Bs 0.00</p></body></html>`;
    const rates = normalizeRates({
      buy_bob_per_usd: 12.48,
      sell_bob_per_usd: 12.44,
      buy_bob_per_eur: 14.2,
      sell_bob_per_eur: 14.1,
      updated_at_iso: '2026-09-07T19:00:00.000Z',
    });
    const applied = applyLiveSeo(html, '/euro-a-boliviano', rates);
    assert.ok(applied?.live);
    assert.match(applied.html, /Compra 14\.20/);
    assert.doesNotMatch(applied.html, /Compra 12\.48/);
  });

  it('fills data-live-usd100 from the buy snapshot', () => {
    const html = `<p>compra <span data-live-buy>—</span> · 100 USD ≈ <span data-live-usd100>—</span></p>`;
    const out = fillLiveRateSlots(html, '11.61', '11.50', '2026-09-12T15:00:00.000Z');
    assert.match(out, /data-live-buy[^>]*>11\.61/);
    assert.match(out, /data-live-usd100[^>]*>1161/);
  });

  it('keeps the press-kit title stable and puts rates in the description', () => {
    const meta = metaForPath('/prensa', '11.61', '11.50');
    assert.equal(meta.title, 'Prensa Bolivia Blue | Kit de medios, citas y datos');
    assert.match(meta.description, /11\.61/);
    assert.match(meta.description, /11\.50/);
  });

  it('puts live rates in the traveler money-guide titles', () => {
    const es = metaForPath('/guia-dinero-bolivia', '11.61', '11.50');
    assert.match(es.title, /11\.61/);
    assert.match(es.description, /viajeros/i);
    const en = metaForPath('/bolivia-money-guide', '11.61', '11.50');
    assert.match(en.title, /Money Guide/i);
    assert.match(en.description, /11\.50/);
  });

  it('puts live Santa Cruz rates in the city title', () => {
    const html = `<html><head><title>x</title><meta name="description" content="d" /><meta property="og:title" content="x" /><meta property="og:description" content="d" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="d" /></head><body><p>compra Bs 0.00 · venta Bs 0.00</p></body></html>`;
    const rates = normalizeRates({
      buy_bob_per_usd: 11.87,
      sell_bob_per_usd: 11.75,
    });
    const applied = applyLiveSeo(html, '/dolar-blue-santa-cruz', rates);
    assert.ok(applied?.live);
    assert.match(applied.html, /<title>Dólar Blue Santa Cruz Hoy: Compra 11\.87 · Venta 11\.75<\/title>/);
    assert.doesNotMatch(applied.html, /<title>[^<]*0\.00/);
  });

  it('keeps English euro URLs self-canonical instead of pointing at Spanish', () => {
    const html = `<html lang="es"><head><link rel="canonical" href="https://www.boliviablue.com/euro-a-boliviano" /><link rel="alternate" hreflang="es" href="https://www.boliviablue.com/euro-a-boliviano" /><link rel="alternate" hreflang="en" href="https://www.boliviablue.com/euro-a-boliviano?lang=en" /><title>x</title><meta name="description" content="d" /><meta property="og:url" content="https://www.boliviablue.com/euro-a-boliviano" /><meta property="og:title" content="x" /><meta property="og:description" content="d" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="d" /></head><body></body></html>`;
    const out = applyEnglishAnnotations(html, '/euro-a-boliviano', { buy: '14.20', sell: '14.10' });
    assert.match(out, /rel="canonical" href="https:\/\/www\.boliviablue\.com\/euro-a-boliviano\?lang=en"/);
    assert.match(out, /hreflang="es" href="https:\/\/www\.boliviablue\.com\/euro-a-boliviano"/);
    assert.match(out, /lang="en"/);
    assert.match(out, /Euro Blue Bolivia Today: Buy 14\.20/);
    assert.equal(withLangQuery('https://www.boliviablue.com/', 'en'), 'https://www.boliviablue.com/?lang=en');
  });
});
