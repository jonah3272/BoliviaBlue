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
    assert.deepEqual(rates, {
      buy: '12.35',
      sell: '12.68',
      updatedAt: '2026-08-01T20:00:00.000Z',
    });
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
    assert.match(out, /mercado paralelo/);
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
    assert.match(html, /og:title" content="Dólar Blue Bolivia Hoy: Compra 12\.34 · Venta 12\.56"/);
    assert.match(html, /twitter:description" content="El dólar paralelo/);
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
