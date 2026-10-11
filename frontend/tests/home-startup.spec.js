import { test, expect } from '@playwright/test';
import { renderDollarRateHtml } from '../../seo/dollarRateSeo.js';

// Exercise built, code-split assets. Preview has no Edge middleware, so apply the
// real homepage shell transform to its document, including the English response.
test.beforeEach(async ({ page, baseURL }) => {
  const origin = new URL(baseURL).origin;
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: [] });
    if (request.resourceType() === 'document' && url.pathname === '/') {
      const response = await route.fetch();
      return route.fulfill({ response, body: renderDollarRateHtml(await response.text(), '/', null, url.searchParams.get('lang') || 'es') });
    }
    return route.continue();
  });
  await page.addInitScript(() => {
    window.__homeLoadingFallbackSeen = false;
    new MutationObserver(() => {
      if (document.querySelector('[data-adsense-block="loading-screen"]')) window.__homeLoadingFallbackSeen = true;
    }).observe(document, { childList: true, subtree: true });
  });
});

async function typography(locator) {
  return locator.evaluate(node => {
    const style = getComputedStyle(node);
    return { size: style.fontSize, leading: style.lineHeight, tracking: style.letterSpacing, weight: style.fontWeight };
  });
}

for (const language of ['es', 'en']) for (const width of [390, 640, 700, 767, 768, 1280]) {
  test(`${language} ${width}px: delayed Home keeps its shell and stable heading through mount`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    let release;
    let requested;
    const gate = new Promise(resolve => { release = resolve; });
    const homeRequested = new Promise(resolve => { requested = resolve; });
    await page.route('**/assets/Home-*.js', async route => { requested(); await gate; await route.continue(); });
    await page.goto(`/?lang=${language}`, { waitUntil: 'commit' });
    await homeRequested;
    const shell = page.locator('[data-seo-shell]');
    await expect(shell).toBeVisible();
    const initial = await typography(shell.locator('h1'));
    expect(initial.size).toBe(width < 768 ? '24px' : '48px');
    const initialRates = language === 'es' && width < 768 ? await typography(shell.locator('[data-home-rate-line]')) : null;
    const initialConversion = language === 'es' && width < 768 ? await typography(shell.locator('[data-home-conversion]')) : null;
    await page.screenshot({ path: testInfo.outputPath('initial-shell.png') });
    expect(await page.evaluate(() => window.__homeLoadingFallbackSeen)).toBe(false);
    release();
    await expect(shell).toHaveCount(0);
    const visibleHeading = page.locator('main h1:visible');
    await expect(visibleHeading).toHaveCount(1);
    expect(await typography(visibleHeading)).toEqual(initial);
    if (initialRates) {
      const rates = page.locator('[data-mobile-hero-rates]');
      expect(await typography(rates.locator('p').nth(0))).toEqual(initialRates);
      expect(await typography(rates.locator('p').nth(1))).toEqual(initialConversion);
    }
    expect(await page.evaluate(() => window.__homeLoadingFallbackSeen)).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('interactive-home.png') });
  });
}

for (const language of ['es', 'en']) {
  test(`${language}: failed Home download retains readable content and reload recovers`, async ({ page }) => {
    let fail = true;
    await page.route('**/assets/Home-*.js', route => fail ? route.abort('failed') : route.continue());
    await page.goto(`/?lang=${language}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-seo-shell] h1')).toBeVisible();
    const reload = page.getByRole('button', { name: language === 'en' ? 'Reload page' : 'Recargar página' });
    await expect(reload).toBeVisible();
    await expect(page.locator('[data-home-startup-notice]')).toHaveCount(1);
    fail = false;
    await reload.click();
    await expect(page.locator('[data-seo-shell]')).toHaveCount(0);
    await expect(page.locator('main h1:visible')).toHaveCount(1);
    expect(await page.evaluate(() => window.__homeLoadingFallbackSeen)).toBe(false);
  });
}
