/**
 * Measure mobile CLS via PerformanceObserver layout-shift entries.
 * Usage: node scripts/measure-cls.mjs [url]
 */
import { chromium, devices } from '@playwright/test';

const url =
  process.argv[2] ||
  'https://www.boliviablue.com/euro-a-boliviano?lang=en';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  if (process.env.CLS_THROTTLE === '1') {
    await context.route('**/*', async (route) => {
      await new Promise((r) => setTimeout(r, 40));
      return route.continue();
    });
  }

  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__cls = { score: 0, shifts: [] };
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cls.score += entry.value;
          const sources = (entry.sources || []).map((s) => {
            const n = s.node;
            if (!n) return { value: entry.value, node: '(detached)' };
            const tag = n.nodeName?.toLowerCase?.() || '?';
            const cls = typeof n.className === 'string' ? n.className.slice(0, 80) : '';
            const id = n.id || '';
            const text = (n.innerText || n.textContent || '').replace(/\s+/g, ' ').slice(0, 60);
            return {
              value: entry.value,
              tag,
              id,
              className: cls,
              text,
            };
          });
          window.__cls.shifts.push({
            value: entry.value,
            startTime: entry.startTime,
            sources: sources.length ? sources : [{ value: entry.value, node: '(no source)' }],
          });
        }
      }
    });
    po.observe({ type: 'layout-shift', buffered: true });
  });

  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('#root', { timeout: 30000 });
  // Wait for React route content (snapshot or main article)
  try {
    await page.waitForSelector('[data-currency-rate-snapshot], main h1', { timeout: 30000 });
  } catch {
    /* continue — still report whatever loaded */
  }
  // Allow late ads / rate fetch / fonts
  await page.waitForTimeout(8000);

  const result = await page.evaluate(() => ({
    cls: window.__cls,
    title: document.title,
    h1: document.querySelector('h1')?.innerText || null,
    snapshot: !!document.querySelector('[data-currency-rate-snapshot]'),
    status: document.readyState,
  }));
  const maxShift = result.cls.shifts.reduce((m, s) => Math.max(m, s.value), 0);

  console.log(
    JSON.stringify(
      {
        url,
        httpStatus: resp?.status(),
        title: result.title,
        h1: result.h1,
        hasSnapshot: result.snapshot,
        cls: result.cls.score,
        maxShift,
        shifts: result.cls.shifts,
      },
      null,
      2
    )
  );
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
