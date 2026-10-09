import { test, expect } from '@playwright/test';

// Keep publisher tests independent of live rates, the backend, and the host timezone.
const NOW = new Date('2026-10-09T12:00:00.000Z');
const OBSERVED = '2026-10-09T11:55:00.000Z';
const MINUTE = 60_000;
const API = 'https://www.boliviablue.com/api/blue-rate';
const ROOT = '[data-bb-widget]';

// Deliberately not Bolivia: embed timestamps must ignore the reader's timezone.
test.use({ timezoneId: 'Pacific/Auckland' });

function observation(overrides = {}) {
  return {
    buy_bob_per_usd: 9.12,
    sell_bob_per_usd: 9.34,
    mid_bob_per_usd: 9.23,
    official_buy: 6.86,
    official_sell: 6.96,
    updated_at_iso: OBSERVED,
    generated_at_iso: NOW.toISOString(),
    is_stale: false,
    quote_kind: 'usdt_p2p_median',
    ...overrides,
  };
}

async function mockRate(page, initial = observation()) {
  const state = { calls: 0, body: initial, status: 200 };
  await page.route('**/api/blue-rate*', async (route) => {
    state.calls += 1;
    await route.fulfill({
      status: state.status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(state.body),
    });
  });
  return state;
}

function publisherMarkup(widgets) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}</style></head><body>${widgets.map(({ target = 'bolivia-blue-widget', lang = 'es', theme = 'light', api = API, includeTarget = true }) => `${includeTarget ? `<div id="${target}"></div>` : ''}<script src="/embed.js" data-target="${target}" data-lang="${lang}" data-theme="${theme}" data-api="${api}"></script>`).join('')}</body></html>`;
}

async function openPublisher(page, widgets = [{}]) {
  await page.route('**/__widget-test__', (route) => route.fulfill({
    contentType: 'text/html', body: publisherMarkup(widgets),
  }));
  await page.goto('/__widget-test__');
  await expect(page.locator(ROOT)).toHaveCount(widgets.length);
}

async function expectRates(root, buy = '9.12', sell = '9.34') {
  await expect(root.locator('[data-bb-buy]')).toContainText(buy);
  await expect(root.locator('[data-bb-sell]')).toContainText(sell);
}

async function expectNoLiveClaim(root) {
  await expect(root).not.toContainText(/\bLIVE\b|\bEN VIVO\b/);
}

async function assertFits(frame, width, height) {
  const box = await frame.locator(ROOT).boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThanOrEqual(width);
  const dimensions = await frame.evaluate(() => ({
    width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
  }));
  expect(dimensions.width).toBeLessThanOrEqual(width);
  expect(dimensions.height).toBeLessThanOrEqual(height);
  // Scrollbars/overflow:hidden must not conceal the attribution or timestamp.
  const contentBottom = await frame.locator(ROOT).evaluate((root) => Math.max(...[root, ...root.querySelectorAll('*')].map((node) => node.getBoundingClientRect().bottom)));
  expect(contentBottom).toBeLessThanOrEqual(height);
}

test.beforeEach(async ({ page, baseURL }) => {
  await page.clock.install({ time: new Date(NOW.getTime() - 1_000) });
  await page.clock.pauseAt(NOW);
  // Tests never send analytics, load ads, or ask a production backend for rates.
  const localOrigin = new URL(baseURL).origin;
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === localOrigin) return route.fallback();
    return route.abort();
  });
  await page.route('**/api/**', (route) => route.fulfill({ json: [] }));
});

test.describe('Publisher rate truthfulness', () => {
  test('fresh quote names the P2P reference, units, observed time, and source', async ({ page }) => {
    await mockRate(page);
    await openPublisher(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(root);
    await expect(root).toContainText(/P2P.*USDT\s*\/\s*BOB/);
    await expect(root).toContainText('BOB por USDT');
    await expect(root.locator('[data-bb-status-text]')).toHaveText('Lectura reciente');
    await expect(root).toContainText(/no es dólar en efectivo ni tipo oficial del BCB/i);
    await expect(root).toContainText(/Bolivia.*UTC[−-]4/);
    await expect(root.locator('[data-bb-time]')).toContainText(/0?7:55/);
    await expect(root.locator('[data-bb-time]')).not.toContainText('08:00');
    await expectNoLiveClaim(root);
    const attribution = root.getByRole('link', { name: /boliviablue\.com/i });
    await expect(attribution).toHaveAttribute('href', /https:\/\/www\.boliviablue\.com\/dolar-blue-hoy\?.*utm_medium=widget/);
    await expect(attribution).toHaveAttribute('rel', /noopener/);
  });

  test('age beyond 20 minutes is stale even when API says fresh', async ({ page }) => {
    await mockRate(page, observation({ updated_at_iso: '2026-10-09T11:39:00Z' }));
    await openPublisher(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'stale');
    await expect(root.locator('[data-bb-status-text]')).toHaveText('Lectura desactualizada');
    await expectRates(root);
    await expectNoLiveClaim(root);
  });

  test('API stale flag overrides a recent timestamp', async ({ page }) => {
    await mockRate(page, observation({ is_stale: true }));
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'stale');
    await expectRates(page.locator(ROOT));
  });

  for (const [name, timestamp] of [
    ['missing', null],
    ['invalid', 'not-a-date'],
    ['future', '2026-10-09T13:00:00Z'],
    ['timezone-free', '2026-10-09T11:55:00'],
    ['impossible calendar date', '2026-02-30T11:55:00Z'],
  ]) {
    test(`${name} observation time cannot be presented as fresh`, async ({ page }) => {
      await mockRate(page, observation({ updated_at_iso: timestamp }));
      await openPublisher(page);
      const root = page.locator(ROOT);
      await expect(root).toHaveAttribute('data-bb-status', 'unknown');
      await expect(root.locator('[data-bb-status-text]')).toHaveText('Lectura sin verificar');
      await expectNoLiveClaim(root);
      await expect(root).not.toContainText('Invalid Date');
      // A recently generated response is not a market observation.
      await expect(root.locator('[data-bb-time]')).not.toContainText('08:00');
    });
  }

  for (const [name, rates] of [
    ['missing buy', { buy_bob_per_usd: null }],
    ['missing sell', { sell_bob_per_usd: null }],
    ['zero buy', { buy_bob_per_usd: 0 }],
    ['negative sell', { sell_bob_per_usd: -1 }],
    ['non-numeric buy', { buy_bob_per_usd: 'not-a-rate' }],
    ['numeric string', { sell_bob_per_usd: '9.34' }],
  ]) {
    test(`${name} cannot produce a fresh quote or a fabricated zero`, async ({ page }) => {
      await mockRate(page, observation(rates));
      await openPublisher(page);
      const root = page.locator(ROOT);
      await expect(root).toHaveAttribute('data-bb-status', 'unknown');
      await expect(root).not.toContainText(/NaN|Infinity|0\.00/);
      await expectNoLiveClaim(root);
      await expect(root.getByRole('link', { name: /boliviablue\.com/i })).toBeVisible();
    });
  }

  test('initial API failure is explicit, has attribution, and recovers', async ({ page }) => {
    const api = await mockRate(page);
    api.status = 503;
    await openPublisher(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'error');
    await expectNoLiveClaim(root);
    await expect(root.getByRole('link', { name: /boliviablue\.com/i })).toBeVisible();
    api.status = 200;
    await page.clock.runFor(MINUTE);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(root);
  });


  test('a hung request times out after 10 seconds and the next poll recovers', async ({ page }) => {
    let calls = 0;
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    await page.route('**/api/blue-rate*', async (route) => {
      calls += 1;
      if (calls === 1) await pending;
      await route.fulfill({ json: observation(), headers: { 'access-control-allow-origin': '*' } });
    });
    try {
      await openPublisher(page);
      await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'loading');
      await expect.poll(() => calls).toBe(1);
      await page.clock.runFor(10_001);
      await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'error');
      await page.clock.runFor(49_999);
      await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
      await expectRates(page.locator(ROOT));
      expect(calls).toBe(2);
    } finally {
      release();
    }
  });

  test('failed refresh retains the last valid values and observation time', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    const observedText = await root.locator('[data-bb-time]').innerText();
    api.status = 503;
    await page.clock.runFor(MINUTE);
    await expect(root).toHaveAttribute('data-bb-status', 'error');
    await expect(root.locator('[data-bb-status-text]')).toHaveText('Falló actualización · última lectura');
    await expectRates(root);
    await expect(root.locator('[data-bb-time]')).toHaveText(observedText);
    await expectNoLiveClaim(root);
    api.status = 200;
    api.body = observation({ buy_bob_per_usd: 9.56, sell_bob_per_usd: 9.78, updated_at_iso: '2026-10-09T12:01:00Z' });
    await page.clock.runFor(MINUTE);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(root, '9.56', '9.78');
    await expect(root.locator('[data-bb-time]')).toContainText(/0?8:01/);
  });

  test('malformed refresh cannot overwrite a valid dated observation', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    const observedText = await root.locator('[data-bb-time]').innerText();
    api.body = observation({ buy_bob_per_usd: null, updated_at_iso: 'not-a-date' });
    await page.clock.runFor(MINUTE);
    await expect(root).toHaveAttribute('data-bb-status', 'error');
    await expectRates(root);
    await expect(root.locator('[data-bb-time]')).toHaveText(observedText);
  });

  test('successful polling updates quotes without a page reload', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    await expectRates(page.locator(ROOT));
    api.body = observation({ buy_bob_per_usd: 9.56, sell_bob_per_usd: 9.78, updated_at_iso: '2026-10-09T12:00:30Z' });
    await page.clock.runFor(MINUTE);
    await expectRates(page.locator(ROOT), '9.56', '9.78');
    expect(api.calls).toBe(2);
  });

  test('unchanged observations age into stale while the page stays open', async ({ page }) => {
    const api = await mockRate(page, observation({ updated_at_iso: '2026-10-09T11:40:30Z' }));
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.clock.runFor(MINUTE);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'stale');
    expect(api.calls).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Publisher lifecycle and options', () => {
  test('multiple script tags share one request and one polling loop per API', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page, [{ target: 'first' }, { target: 'second', lang: 'en', theme: 'dark' }]);
    await expect(page.locator(`${ROOT}[data-bb-status="fresh"]`)).toHaveCount(2);
    expect(api.calls).toBe(1);
    await page.clock.runFor(MINUTE);
    await expect.poll(() => api.calls).toBe(2);
    await page.clock.runFor(MINUTE);
    await expect.poll(() => api.calls).toBe(3);
  });

  test('widgets mounted during a refresh share its in-flight request', async ({ page }) => {
    let calls = 0;
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    await page.route('**/api/blue-rate*', async (route) => {
      calls += 1;
      if (calls === 2) await pending;
      await route.fulfill({ json: observation({ buy_bob_per_usd: calls === 2 ? 9.56 : 9.12 }), headers: { 'access-control-allow-origin': '*' } });
    });
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.clock.runFor(MINUTE);
    await expect.poll(() => calls).toBe(2);
    await page.evaluate(() => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      window.BoliviaBlueWidget.mount(target, { lang: 'en' });
      window.BoliviaBlueWidget.mount(target, { lang: 'es' });
    });
    await page.clock.runFor(5_000);
    expect(calls).toBe(2);
    release();
    await expect(page.locator(`${ROOT}[data-bb-status="fresh"]`)).toHaveCount(2);
    await expect(page.locator('[data-bb-buy]')).toHaveText(['9.56', '9.56']);
  });

  test('removing one widget preserves its sibling; removing all stops polling', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page, [{ target: 'first' }, { target: 'second' }]);
    await expect(page.locator(`${ROOT}[data-bb-status="fresh"]`)).toHaveCount(2);
    await page.locator('#first').evaluate((el) => el.remove());
    await page.clock.runFor(MINUTE);
    await expect.poll(() => api.calls).toBe(2);
    await expect(page.locator('#second').locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.locator('#second').evaluate((el) => el.remove());
    const before = api.calls;
    await page.clock.runFor(3 * MINUTE);
    expect(api.calls).toBe(before);
  });

  test('repeated mount is idempotent and unmount releases the polling loop', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.evaluate(() => {
      const target = document.getElementById('bolivia-blue-widget');
      for (let i = 0; i < 5; i += 1) window.BoliviaBlueWidget.mount(target, { lang: 'es', theme: 'light' });
    });
    await expect(page.locator(ROOT)).toHaveCount(1);
    await page.clock.runFor(MINUTE);
    expect(api.calls).toBe(2);
    await page.evaluate(() => window.BoliviaBlueWidget.unmount(document.getElementById('bolivia-blue-widget')));
    const before = api.calls;
    await page.clock.runFor(3 * MINUTE);
    expect(api.calls).toBe(before);
  });

  test('pagehide stops network polling', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    const before = api.calls;
    await page.clock.runFor(3 * MINUTE);
    expect(api.calls).toBe(before);
  });


  test('persisted pagehide pauses polling and pageshow resumes the widget', async ({ page }) => {
    const api = await mockRate(page);
    await openPublisher(page);
    await expect(page.locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    const before = api.calls;
    await page.clock.runFor(3 * MINUTE);
    expect(api.calls).toBe(before);
    api.body = observation({ buy_bob_per_usd: 9.56, sell_bob_per_usd: 9.78, updated_at_iso: '2026-10-09T12:02:00Z' });
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expectRates(page.locator(ROOT), '9.56', '9.78');
    expect(api.calls).toBe(before + 1);
    await page.clock.runFor(MINUTE);
    await expect.poll(() => api.calls).toBe(before + 2);
  });

  test('different API endpoints never share snapshots or polling state', async ({ page }) => {
    const calls = { first: 0, second: 0 };
    await page.route('**/publisher-api/*', (route) => {
      const key = route.request().url().endsWith('/first') ? 'first' : 'second';
      calls[key] += 1;
      return route.fulfill({ json: observation({ buy_bob_per_usd: key === 'first' ? 10.12 : 11.12 }) });
    });
    await openPublisher(page, [{ target: 'first', api: '/publisher-api/first' }, { target: 'second', api: '/publisher-api/second' }]);
    await expectRates(page.locator('#first').locator(ROOT), '10.12');
    await expectRates(page.locator('#second').locator(ROOT), '11.12');
    expect(calls).toEqual({ first: 1, second: 1 });
    await page.clock.runFor(MINUTE);
    await expect.poll(() => ({ ...calls })).toEqual({ first: 2, second: 2 });
  });

  test('custom API and missing target are supported', async ({ page }) => {
    let customCalls = 0;
    await page.route('**/publisher-api', (route) => {
      customCalls += 1;
      return route.fulfill({ json: observation({ buy_bob_per_usd: 10.12, sell_bob_per_usd: 10.34 }) });
    });
    await openPublisher(page, [{ target: 'created-target', api: '/publisher-api', includeTarget: false }]);
    await expect(page.locator('#created-target').locator(ROOT)).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(page.locator(ROOT), '10.12', '10.34');
    expect(customCalls).toBe(1);
  });

  for (const lang of ['es', 'en']) {
    for (const theme of ['light', 'dark']) {
      test(`${lang}/${theme} options preserve language, contrast, and quote units`, async ({ page }) => {
        await mockRate(page);
        await openPublisher(page, [{ lang, theme }]);
        const root = page.locator(ROOT);
        await expect(root).toHaveAttribute('data-bb-status', 'fresh');
        await expect(root).toContainText(lang === 'en' ? 'BOB per USDT' : 'BOB por USDT');
        await expect(root).toContainText(lang === 'en' ? 'Buy' : 'Compra');
        await expect(root).toContainText(lang === 'en' ? 'Sell' : 'Venta');
        const colors = await root.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, fg: getComputedStyle(el).color }));
        expect(colors.bg).toBe(theme === 'dark' ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)');
        expect(colors.fg).toBe(theme === 'dark' ? 'rgb(249, 250, 251)' : 'rgb(17, 24, 39)');
      });
    }
  }
});

test.describe('Iframe parity and narrow publisher columns', () => {
  for (const width of [280, 320, 360]) {
    for (const lang of ['es', 'en']) {
      for (const height of [190, 300]) {
        test(`${width}px ${lang} iframe fits ${height}px height without clipping`, async ({ page }) => {
          await mockRate(page);
          await page.route('**/__iframe-test__', (route) => route.fulfill({
            contentType: 'text/html',
            body: `<!doctype html><html><body style="margin:0"><iframe title="Rate" width="${width}" height="${height}" style="border:0" src="/embed.html?lang=${lang}&theme=dark"></iframe></body></html>`,
          }));
          await page.goto('/__iframe-test__');
          const frame = page.frames().find((item) => item.url().includes('/embed.html'));
          expect(frame).toBeTruthy();
          const root = frame.locator(ROOT);
          await expect(root).toHaveAttribute('data-bb-status', 'fresh');
          await expectRates(root);
          await expect(root).toContainText(lang === 'en' ? 'BOB per USDT' : 'BOB por USDT');
          await expect(root.getByRole('link', { name: /boliviablue\.com/i })).toHaveAttribute('href', /utm_medium=iframe/);
          await expect(root).toHaveCSS('background-color', 'rgb(17, 24, 39)');
          await assertFits(frame, width, height);
        });
      }
    }
  }

  test('stale refresh-failure copy fits a legacy 280 by 190 iframe', async ({ page }) => {
    const api = await mockRate(page, observation({ is_stale: true }));
    await page.route('**/__iframe-test__', (route) => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body style="margin:0"><iframe width="280" height="190" style="border:0" src="/embed.html?lang=es&theme=light"></iframe></body></html>',
    }));
    await page.goto('/__iframe-test__');
    const frame = page.frames().find((item) => item.url().includes('/embed.html'));
    const root = frame.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'stale');
    api.status = 503;
    await page.clock.runFor(MINUTE);
    await expect(root.locator('[data-bb-status-text]')).toHaveText('Lectura desactualizada · falló actualización');
    await expectRates(root);
    await assertFits(frame, 280, 190);
  });

  test('a script download failure still leaves a usable attribution link', async ({ page }) => {
    await page.route('**/embed.js', (route) => route.abort());
    await page.goto('/embed.html?lang=en');
    await expect(page.getByText('Observation unavailable.', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: /See Bolivia Blue/ })).toHaveAttribute('href', /https:\/\/www\.boliviablue\.com\/dolar-blue-hoy.*utm_medium=iframe/);
    await expect(page.locator(ROOT)).toHaveCount(0);
  });

  test('iframe uses the same stale and refresh behavior as script embeds', async ({ page }) => {
    const api = await mockRate(page, observation({ is_stale: true }));
    await page.goto('/embed.html?lang=en&theme=light');
    const root = page.locator(ROOT);
    await expect(root).toHaveAttribute('data-bb-status', 'stale');
    await expectNoLiveClaim(root);
    api.body = observation({ buy_bob_per_usd: 9.56, sell_bob_per_usd: 9.78, updated_at_iso: '2026-10-09T12:00:30Z' });
    await page.clock.runFor(MINUTE);
    await expect(root).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(root, '9.56', '9.78');
  });
});

test.describe('React widget preview lifecycle', () => {
  test('direct load and repeated SPA Back/Forward remount a single working preview', async ({ page }) => {
    await mockRate(page);
    await page.goto('/widget');
    const preview = page.locator('#bolivia-blue-widget-preview').locator(ROOT);
    await expect(preview).toHaveAttribute('data-bb-status', 'fresh');
    await expectRates(preview);
    await page.evaluate(() => { window.__widgetTestDocument = 'preserved'; });
    for (let repeat = 0; repeat < 2; repeat += 1) {
      await page.locator('footer a[href="/acerca-de"]').evaluate((link) => link.click());
      await expect(page).toHaveURL(/\/acerca-de(?:\?|$)/);
      await expect(page.locator('#bolivia-blue-widget-preview')).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(/\/widget(?:\?|$)/);
      await expect(preview).toHaveCount(1);
      await expect(preview).toHaveAttribute('data-bb-status', 'fresh');
      await expectRates(preview);
      await page.goForward();
      await expect(page).toHaveURL(/\/acerca-de(?:\?|$)/);
      await page.goBack();
      await expect(preview).toHaveAttribute('data-bb-status', 'fresh');
    }
    expect(await page.evaluate(() => window.__widgetTestDocument)).toBe('preserved');
    await expect(page.locator('script[src="/embed.js"]')).toHaveCount(1);
  });

  test('preview reacts to ES/EN changes without creating duplicate widgets', async ({ page }) => {
    await mockRate(page);
    await page.goto('/widget');
    const preview = page.locator('#bolivia-blue-widget-preview').locator(ROOT);
    await expect(preview).toContainText('BOB por USDT');
    await page.getByRole('button', { name: 'Toggle language' }).click({ force: true });
    await expect(preview).toContainText('BOB per USDT');
    await expect(preview).toHaveCount(1);
    await page.getByRole('button', { name: 'Toggle language' }).click({ force: true });
    await expect(preview).toContainText('BOB por USDT');
    await expect(preview).toHaveCount(1);
  });
});
