/**
 * Fetch indicative US card-network FX rates for USD/BOB (BOB per 1 USD).
 *
 * Prefer official Mastercard / public converters when available.
 * Until Visa/MC production feeds work, fall back to Wise mid-market
 * remittance rate (honest proxy — labeled in source/notes).
 */
import fetch from 'node-fetch';
import {
  fetchMastercardOfficialBobPerUsd,
  hasMastercardCredentials
} from './mastercardRateClient.js';

const TIMEOUT_MS = 12000;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
/** Plausible BOB per USD band (rejects sandbox mocks / bad scrapes). */
const BOB_PER_USD_MIN = 8;
const BOB_PER_USD_MAX = 25;

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function assertPlausibleBobPerUsd(bobPerUsd, label) {
  if (!Number.isFinite(bobPerUsd) || bobPerUsd < BOB_PER_USD_MIN || bobPerUsd > BOB_PER_USD_MAX) {
    throw new Error(`${label} rate ${bobPerUsd} outside plausible ${BOB_PER_USD_MIN}–${BOB_PER_USD_MAX} BOB/USD`);
  }
  return bobPerUsd;
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

/**
 * Wise comparison quote (USD→BOB). Remittance mid-market, used as temporary
 * stand-in for Visa/MC/Amex until network production APIs are available.
 */
export async function fetchWiseBobPerUsd() {
  const url =
    'https://wise.com/gateway/v3/comparisons?sourceCurrency=USD&targetCurrency=BOB&sendAmount=100';
  const data = await fetchJson(url, {
    Accept: 'application/json',
    Referer: 'https://wise.com/',
    Origin: 'https://wise.com'
  });
  const providers = Array.isArray(data?.providers) ? data.providers : [];
  const wise =
    providers.find(
      (p) =>
        String(p?.name || '').toLowerCase() === 'wise' ||
        String(p?.alias || '').toLowerCase() === 'wise'
    ) || providers[0];
  const quote = wise?.quotes?.[0];
  const rate = Number(quote?.rate);
  assertPlausibleBobPerUsd(rate, 'Wise');
  return {
    bobPerUsd: round4(rate),
    raw: { provider: wise?.name, quote },
    source: 'wise-proxy'
  };
}

function acceptNetworkRate(result, label, notes) {
  if (!result?.bobPerUsd) return null;
  try {
    assertPlausibleBobPerUsd(result.bobPerUsd, label);
    return result;
  } catch (err) {
    notes.push(`${label}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch all three network rates.
 * Prefer: Mastercard official API → HTTP converters → browser scrape (CI) → Wise proxy.
 */
export async function getCardNetworkRates() {
  const notes = [];
  const sources = [];

  let visa = null;
  let mc = null;
  let amex = null;

  if (hasMastercardCredentials()) {
    try {
      const official = await fetchMastercardOfficialBobPerUsd();
      mc = acceptNetworkRate(official, 'mastercard-official', notes);
      if (mc) notes.push('mastercard via official API');
    } catch (err) {
      notes.push(`mastercard-official: ${err.message}`);
    }
  }

  const settled = await Promise.allSettled([
    fetchVisaBobPerUsd(),
    mc ? Promise.resolve(mc) : fetchMastercardBobPerUsd(),
    fetchAmexBobPerUsd()
  ]);

  if (!visa && settled[0].status === 'fulfilled') {
    visa = acceptNetworkRate(settled[0].value, 'visa-http', notes);
  } else if (settled[0].status === 'rejected') {
    notes.push(`visa-http: ${settled[0].reason?.message || 'failed'}`);
  }

  if (!mc && settled[1].status === 'fulfilled') {
    mc = acceptNetworkRate(settled[1].value, 'mastercard-http', notes);
  } else if (!mc && settled[1].status === 'rejected') {
    notes.push(`mastercard-http: ${settled[1].reason?.message || 'failed'}`);
  }

  if (settled[2].status === 'fulfilled') {
    amex = acceptNetworkRate(settled[2].value, 'amex-http', notes);
  } else {
    notes.push(`amex-http: ${settled[2].reason?.message || 'failed'}`);
  }

  const wantBrowser =
    process.env.CARD_RATE_BROWSER === '1' ||
    process.env.CARD_RATE_BROWSER === 'true';

  if (wantBrowser && (!visa || !mc)) {
    try {
      const { scrapeMastercardBobPerUsd, scrapeVisaBobPerUsd } = await import(
        './cardRateBrowser.js'
      );
      if (!mc) {
        try {
          mc = acceptNetworkRate(await scrapeMastercardBobPerUsd(), 'mastercard-browser', notes);
          if (mc) notes.push('mastercard via browser scrape');
        } catch (err) {
          notes.push(`mastercard-browser: ${err.message}`);
        }
      }
      if (!visa) {
        try {
          visa = acceptNetworkRate(await scrapeVisaBobPerUsd(), 'visa-browser', notes);
          if (visa) notes.push('visa via browser scrape');
        } catch (err) {
          notes.push(`visa-browser: ${err.message}`);
        }
      }
    } catch (err) {
      notes.push(`browser-scrape unavailable: ${err.message}`);
    }
  }

  // Temporary: fill missing networks with Wise remittance rate (labeled proxy).
  if (!visa || !mc || !amex) {
    try {
      const wise = await fetchWiseBobPerUsd();
      if (!visa) {
        visa = wise;
        notes.push('visa via Wise proxy (temporary)');
      }
      if (!mc) {
        mc = wise;
        notes.push('mastercard via Wise proxy (temporary)');
      }
      if (!amex) {
        amex = wise;
        notes.push('amex via Wise proxy (temporary)');
      }
    } catch (err) {
      notes.push(`wise-proxy: ${err.message}`);
    }
  }

  if (!visa) notes.push('visa unavailable');
  if (!mc) notes.push('mastercard unavailable');
  if (!amex) notes.push('amex unavailable');

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
