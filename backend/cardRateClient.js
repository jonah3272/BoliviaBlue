/**
 * Fetch indicative US card-network FX rates for USD/BOB (BOB per 1 USD).
 *
 * Tries public Visa / Mastercard / Amex converters first. When bots are blocked
 * (common 403), falls back to a mid-market USD→BOB proxy for Visa + Mastercard
 * only (Amex stays null — do not invent Amex from Visa/MC).
 */
import fetch from 'node-fetch';

const TIMEOUT_MS = 12000;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchText(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/json, text/plain, */*',
        ...headers
      }
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, headers: res.headers };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, headers = {}) {
  const { ok, status, text } = await fetchText(url, headers);
  if (!ok) throw new Error(`HTTP ${status} for ${url}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON from ${url}`);
  }
}

/**
 * Mastercard settlement converter: spend BOB, bill USD → bob_per_usd = amt / billAmt
 */
export async function fetchMastercardBobPerUsd() {
  const hosts = [
    'https://www.mastercard.us',
    'https://www.mastercard.com',
    'https://www.mastercard.co.uk'
  ];
  const path =
    '/settlement/currencyrate/conversion-rate?fxDate=null&transCurr=BOB&crdhldBillCurr=USD&bankFee=0&transAmt=100';

  let lastErr;
  for (const host of hosts) {
    try {
      const data = await fetchJson(`${host}${path}`, {
        Referer: `${host}/en-us/personal/get-support/convert-currency.html`,
        Origin: host
      });
      const bill = Number(data?.data?.crdhldBillAmt ?? data?.crdhldBillAmt);
      const rate = Number(data?.data?.conversionRate ?? data?.conversionRate);
      if (Number.isFinite(bill) && bill > 0) {
        return { bobPerUsd: round4(100 / bill), raw: data, source: 'mc-converter' };
      }
      if (Number.isFinite(rate) && rate > 0) {
        // conversionRate often = USD per 1 BOB
        return { bobPerUsd: round4(1 / rate), raw: data, source: 'mc-converter' };
      }
      throw new Error('Mastercard response missing rate fields');
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Mastercard rate unavailable');
}

/**
 * Visa consumer FX calculator CMS API
 */
export async function fetchVisaBobPerUsd() {
  const today = todayUtcDate();
  // MM/DD/YYYY as used by Visa travel calculator
  const [y, m, d] = today.split('-');
  const exchangedate = `${m}/${d}/${y}`;
  const urls = [
    `https://usa.visa.com/cmsapi/fx/rates?amount=100&fee=0&utcConvertedDate=${today}&exchangedate=${exchangedate}&fromCurr=BOB&toCurr=USD`,
    `https://usa.visa.com/cmsapi/fx/rates?amount=100&fee=0&utcConvertedDate=${today}&exchangedate=${exchangedate}&fromCurr=USD&toCurr=BOB`
  ];

  let lastErr;
  for (const url of urls) {
    try {
      const data = await fetchJson(url, {
        Referer:
          'https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html',
        Origin: 'https://usa.visa.com'
      });
      // Shapes vary: convertedAmount, toAmount, reverseAmount, fxRate…
      const converted = Number(
        data?.convertedAmount ??
          data?.toAmount ??
          data?.destinationAmount ??
          data?.amount
      );
      const fx = Number(data?.fxRate ?? data?.conversionRate ?? data?.rate);
      if (url.includes('fromCurr=BOB') && Number.isFinite(converted) && converted > 0) {
        return { bobPerUsd: round4(100 / converted), raw: data, source: 'visa-calculator' };
      }
      if (url.includes('fromCurr=USD') && Number.isFinite(converted) && converted > 0) {
        return { bobPerUsd: round4(converted / 100), raw: data, source: 'visa-calculator' };
      }
      if (url.includes('fromCurr=USD') && Number.isFinite(fx) && fx > 0.5) {
        return { bobPerUsd: round4(fx), raw: data, source: 'visa-calculator' };
      }
      if (url.includes('fromCurr=BOB') && Number.isFinite(fx) && fx > 0 && fx < 1) {
        return { bobPerUsd: round4(1 / fx), raw: data, source: 'visa-calculator' };
      }
      throw new Error('Visa response missing rate fields');
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Visa rate unavailable');
}

/**
 * Amex currency converter — often blocked; return null rather than inventing.
 */
export async function fetchAmexBobPerUsd() {
  const urls = [
    'https://www.americanexpress.com/api/servicing/v1/currencyConversion?fromCode=BOB&toCode=USD&amount=100',
    'https://www.americanexpress.com/en-us/account/currency-converter/api/convert?from=BOB&to=USD&amount=100'
  ];
  let lastErr;
  for (const url of urls) {
    try {
      const data = await fetchJson(url, {
        Referer: 'https://www.americanexpress.com/',
        Origin: 'https://www.americanexpress.com'
      });
      const bill = Number(
        data?.convertedAmount ?? data?.toAmount ?? data?.amount ?? data?.result
      );
      const rate = Number(data?.rate ?? data?.fxRate ?? data?.conversionRate);
      if (Number.isFinite(bill) && bill > 0) {
        return { bobPerUsd: round4(100 / bill), raw: data, source: 'amex-converter' };
      }
      if (Number.isFinite(rate) && rate > 0 && rate < 1) {
        return { bobPerUsd: round4(1 / rate), raw: data, source: 'amex-converter' };
      }
      if (Number.isFinite(rate) && rate >= 1) {
        return { bobPerUsd: round4(rate), raw: data, source: 'amex-converter' };
      }
      throw new Error('Amex response missing rate fields');
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Amex rate unavailable');
}

async function fetchMidMarketBobPerUsd() {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  const bob = Number(data?.rates?.BOB);
  if (!Number.isFinite(bob) || bob < 1 || bob > 100) {
    throw new Error('Mid-market BOB rate invalid');
  }
  return {
    bobPerUsd: round4(bob),
    raw: data,
    source: 'mid-market-proxy'
  };
}

/**
 * Fetch all three network rates. Never fabricates Amex from Visa/MC.
 * Prefer: HTTP converters → browser scrape (CI) → mid-market proxy (labeled).
 */
export async function getCardNetworkRates() {
  const notes = [];
  const sources = [];

  const settled = await Promise.allSettled([
    fetchVisaBobPerUsd(),
    fetchMastercardBobPerUsd(),
    fetchAmexBobPerUsd()
  ]);

  let visa = settled[0].status === 'fulfilled' ? settled[0].value : null;
  let mc = settled[1].status === 'fulfilled' ? settled[1].value : null;
  let amex = settled[2].status === 'fulfilled' ? settled[2].value : null;

  if (settled[0].status === 'rejected') {
    notes.push(`visa-http: ${settled[0].reason?.message || 'failed'}`);
  }
  if (settled[1].status === 'rejected') {
    notes.push(`mastercard-http: ${settled[1].reason?.message || 'failed'}`);
  }
  if (settled[2].status === 'rejected') {
    notes.push(`amex-http: ${settled[2].reason?.message || 'failed'}`);
  }

  const wantBrowser =
    process.env.CARD_RATE_BROWSER === '1' ||
    process.env.CARD_RATE_BROWSER === 'true' ||
    !visa ||
    !mc;

  if (wantBrowser && (!visa || !mc)) {
    try {
      const { scrapeMastercardBobPerUsd, scrapeVisaBobPerUsd } = await import(
        './cardRateBrowser.js'
      );
      if (!mc) {
        try {
          mc = await scrapeMastercardBobPerUsd();
          notes.push('mastercard via browser scrape');
        } catch (err) {
          notes.push(`mastercard-browser: ${err.message}`);
        }
      }
      if (!visa) {
        try {
          visa = await scrapeVisaBobPerUsd();
          notes.push('visa via browser scrape');
        } catch (err) {
          notes.push(`visa-browser: ${err.message}`);
        }
      }
    } catch (err) {
      notes.push(`browser-scrape unavailable: ${err.message}`);
    }
  }

  // Do NOT invent Visa/MC from mid-market — leave null so UI shows unavailable.
  // Browser scrape in CI may still succeed from a different IP.
  if (!visa) notes.push('visa unavailable (no network rate)');
  if (!mc) notes.push('mastercard unavailable (no network rate)');
  if (!amex) notes.push('amex unavailable (no network rate)');

  if (visa) sources.push(visa.source);
  if (mc) sources.push(mc.source);
  if (amex) sources.push(amex.source);

  return {
    t: new Date().toISOString(),
    rate_date: todayUtcDate(),
    visa_bob_per_usd: visa?.bobPerUsd ?? null,
    mastercard_bob_per_usd: mc?.bobPerUsd ?? null,
    amex_bob_per_usd: amex?.bobPerUsd ?? null,
    source: [...new Set(sources)].join('+') || 'none',
    notes: notes.length ? notes.join('; ') : null
  };
}
