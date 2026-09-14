/**
 * Probe card FX sources (dev utility).
 * Usage: node scripts/probe-card-sources.js
 */
import fetch from 'node-fetch';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function tryFetch(name, url, headers = {}) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json,*/*', ...headers },
      timeout: 20000
    });
    const t = await r.text();
    console.log(`\n=== ${name} (${r.status}) ===`);
    console.log(t.slice(0, 400));
    return { name, status: r.status, text: t };
  } catch (e) {
    console.log(`\n=== ${name} ERR ===`, e.message);
    return null;
  }
}

const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const mcPath = `/settlement/currencyrate/conversion-rate?fxDate=${yesterday}&transCurr=BOB&crdhldBillCurr=USD&bankFee=0&transAmt=100`;
const mcUrl = `https://www.mastercard.us${mcPath}`;

await tryFetch('fawaz', 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
await tryFetch('open-er', 'https://open.er-api.com/v6/latest/USD');
await tryFetch('bcb-cucu', 'https://apibcb.cucu.bo/api/v1/tc/oficial');
await tryFetch('MC direct', mcUrl, {
  Referer: 'https://www.mastercard.us/en-us/personal/get-support/convert-currency.html',
  Origin: 'https://www.mastercard.us'
});
await tryFetch(
  'MC via allorigins',
  `https://api.allorigins.win/raw?url=${encodeURIComponent(mcUrl)}`
);
await tryFetch(
  'MC via corsproxy',
  `https://corsproxy.io/?${encodeURIComponent(mcUrl)}`
);

const today = new Date().toISOString().slice(0, 10);
const [y, m, d] = today.split('-');
const exchangedate = `${m}/${d}/${y}`;
const visaUrl = `https://usa.visa.com/cmsapi/fx/rates?amount=100&fee=0&utcConvertedDate=${today}&exchangedate=${exchangedate}&fromCurr=BOB&toCurr=USD`;
await tryFetch('Visa direct', visaUrl, {
  Referer: 'https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html'
});
await tryFetch(
  'Visa via allorigins',
  `https://api.allorigins.win/raw?url=${encodeURIComponent(visaUrl)}`
);
