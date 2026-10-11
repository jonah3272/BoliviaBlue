import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const asset = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url));
const ORIGIN = 'https://payment-embed.test';

async function localBuild(page, { blockedScript = false } = {}) {
  const requests = [];
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    if (url.hostname === 'publisher.test') return route.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe src="${ORIGIN}/embed.html?mode=payment-cost&lang=en" title="Payment comparison" width="100%" height="700" style="border:0"></iframe></body>` });
    if (url.origin !== ORIGIN) return route.abort();
    const path = url.pathname.slice(1);
    if (blockedScript && path === 'payment-cost/payment-cost.js') return route.abort();
    if (!['embed.html', 'embed.js', 'payment-cost/payment-cost.js', 'payment-cost/payment-cost.css'].includes(path)) return route.abort();
    return route.fulfill({ contentType: path.endsWith('.css') ? 'text/css' : path.endsWith('.js') ? 'application/javascript' : 'text/html', body: asset(path) });
  });
  return requests;
}

for (const language of ['en', 'es']) test(`production embed ${language}: blank start, input errors, exact result, reset and no data requests`, async ({ page }) => {
  const requests = await localBuild(page);
  await page.goto(`${ORIGIN}/embed.html?mode=payment-cost&lang=${language}&rate=99&bobPrice=999`);
  await expect(page.locator('[data-payment-cost-checker]')).toBeVisible();
  await expect(page.locator('#payment-cost-rate')).toHaveValue('');
  await expect(page.locator('#payment-cost-bobPrice')).toHaveValue('');
  await page.locator('#payment-cost-bobPrice').fill('600');
  await page.locator('#payment-cost-usdPrice').fill('52');
  await page.locator('#payment-cost-rate').fill('12');
  await page.locator('#payment-cost-bobPercent').fill('3');
  await page.locator('#payment-cost-bobFixed').fill('2');
  await page.locator('button[type="submit"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-cost-value="bob-total"]')).toHaveText(language === 'en' ? 'USD 53.50' : 'USD 53,50');
  await expect(page.locator('[data-cost-summary]')).toContainText(language === 'en' ? 'USD 1.50 less' : 'USD 1,50 menos');
  await page.locator('#payment-cost-rate').fill('12abc');
  await expect(page.locator('[data-payment-cost-results]')).toHaveCount(0);
  await expect(page.locator('#payment-cost-rate')).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: language === 'en' ? 'Clear inputs' : 'Borrar datos' }).click();
  await expect(page.locator('#payment-cost-rate')).toHaveValue('');
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(requests.every((url) => url.startsWith(ORIGIN))).toBe(true);
  expect(requests.filter((url) => /\/payment-cost\//.test(url))).toHaveLength(2);
  await page.reload();
  await expect(page.locator('#payment-cost-bobPrice')).toHaveValue('');
});

test('320px cross-origin iframe stays within width and scrolls to all controls and results', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await localBuild(page);
  await page.goto('https://publisher.test/article');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-payment-cost-checker]')).toBeVisible();
  const dimensions = await frame.locator('html').evaluate((root) => ({ width: root.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
  await frame.getByRole('button', { name: 'Try a hypothetical example' }).click();
  await expect(frame.locator('[data-cost-summary]')).toContainText('USD 1.50 less');
  await frame.getByRole('link', { name: 'Mastercard: conversion and bank fee' }).scrollIntoViewIfNeeded();
  expect(await frame.locator('html').evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await frame.getByRole('button', { name: 'Clear inputs' }).click();
  await expect(frame.locator('#payment-cost-rate')).toHaveValue('');
  for (const control of await frame.locator('input, button').all()) expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: '../boliviablue-payment-embed-mobile.png', fullPage: true });
});

test('payment mode falls back to guide when script fails; no-JS page has a payment guide', async ({ browser, page }) => {
  await localBuild(page, { blockedScript: true });
  await page.goto(`${ORIGIN}/embed.html?mode=payment-cost&lang=en`);
  await expect(page.getByRole('link', { name: /Open the payment-cost checker/ })).toHaveAttribute('href', /bolivia-money-guide#payment-cost-comparison/);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await context.newPage();
  await localBuild(nojs);
  await nojs.goto(`${ORIGIN}/embed.html?mode=payment-cost&lang=en`);
  await expect(nojs.getByRole('link', { name: 'Payment guide', exact: true })).toBeVisible();
  await context.close();
});
