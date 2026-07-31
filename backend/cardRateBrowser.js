/**
 * Fetch Mastercard / Visa card FX from inside a real browser context.
 * Plain HTTP is blocked by Akamai/Cloudflare; page-context fetch often works.
 *
 * Requires: playwright (installed in CI). Enable with CARD_RATE_BROWSER=1
 * or auto-try when HTTP fetch fails and playwright is importable.
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

async function loadChromium() {
  try {
    const { chromium } = await import('playwright');
    return chromium;
  } catch {
    try {
      const { chromium } = require('playwright');
      return chromium;
    } catch {
      throw new Error('playwright not installed (set up in GitHub Actions)');
    }
  }
}

/**
 * Mastercard: open converter origin, then fetch settlement API same-origin.
 * Returns BOB per 1 USD.
 */
export async function scrapeMastercardBobPerUsd() {
  const chromium = await loadChromium();
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US'
    });
    await page.goto(
      'https://www.mastercard.us/en-us/personal/get-support/convert-currency.html',
      { waitUntil: 'domcontentloaded', timeout: 45000 }
    );
    // Warm cookies / bot challenge
    await page.waitForTimeout(2000);

    const data = await page.evaluate(async () => {
      const url =
        '/settlement/currencyrate/conversion-rate?fxDate=null&transCurr=BOB&crdhldBillCurr=USD&bankFee=0&transAmt=100';
      const res = await fetch(url, {
        headers: { Accept: 'application/json, text/plain, */*' }
      });
      const text = await res.text();
      return { status: res.status, text };
    });

    if (data.status !== 200) {
      throw new Error(`Mastercard browser fetch HTTP ${data.status}: ${data.text.slice(0, 120)}`);
    }
    const json = JSON.parse(data.text);
    const bill = Number(json?.data?.crdhldBillAmt ?? json?.crdhldBillAmt);
    const rate = Number(json?.data?.conversionRate ?? json?.conversionRate);
    if (Number.isFinite(bill) && bill > 0) {
      return { bobPerUsd: round4(100 / bill), raw: json, source: 'mc-converter' };
    }
    if (Number.isFinite(rate) && rate > 0) {
      return { bobPerUsd: round4(1 / rate), raw: json, source: 'mc-converter' };
    }
    throw new Error('Mastercard browser response missing rate fields');
  } finally {
    await browser.close();
  }
}

/**
 * Visa: load travel calculator origin, hit cmsapi from page context.
 */
export async function scrapeVisaBobPerUsd() {
  const chromium = await loadChromium();
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US'
    });
    await page.goto(
      'https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html',
      { waitUntil: 'domcontentloaded', timeout: 45000 }
    );
    await page.waitForTimeout(3000);

    const today = new Date().toISOString().slice(0, 10);
    const [y, m, d] = today.split('-');
    const exchangedate = `${m}/${d}/${y}`;

    const data = await page.evaluate(
      async ({ today, exchangedate }) => {
        const url = `/cmsapi/fx/rates?amount=100&fee=0&utcConvertedDate=${today}&exchangedate=${exchangedate}&fromCurr=BOB&toCurr=USD`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json, text/plain, */*' }
        });
        const text = await res.text();
        return { status: res.status, text };
      },
      { today, exchangedate }
    );

    if (data.status !== 200) {
      throw new Error(`Visa browser fetch HTTP ${data.status}: ${data.text.slice(0, 120)}`);
    }
    const json = JSON.parse(data.text);
    const converted = Number(
      json?.convertedAmount ?? json?.toAmount ?? json?.destinationAmount ?? json?.amount
    );
    const fx = Number(json?.fxRate ?? json?.conversionRate ?? json?.rate);
    if (Number.isFinite(converted) && converted > 0) {
      return { bobPerUsd: round4(100 / converted), raw: json, source: 'visa-calculator' };
    }
    if (Number.isFinite(fx) && fx > 0 && fx < 1) {
      return { bobPerUsd: round4(1 / fx), raw: json, source: 'visa-calculator' };
    }
    if (Number.isFinite(fx) && fx >= 1) {
      return { bobPerUsd: round4(fx), raw: json, source: 'visa-calculator' };
    }
    throw new Error('Visa browser response missing rate fields');
  } finally {
    await browser.close();
  }
}
