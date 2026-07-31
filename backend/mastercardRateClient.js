/**
 * Official Mastercard Currency Conversion Calculator API (sandbox/production).
 * Auth: OAuth 1.0a RSA-SHA256 via mastercard-oauth1-signer + PKCS#12 key.
 *
 * Env:
 *   MASTERCARD_CONSUMER_KEY
 *   MASTERCARD_P12_PATH (or MASTERCARD_P12_BASE64)
 *   MASTERCARD_KEY_PASSWORD (sandbox default often keystorepassword)
 *   MASTERCARD_KEY_ALIAS (sandbox default often keyalias)
 *   MASTERCARD_SANDBOX=true|false
 */
import fs from 'fs';
import forge from 'node-forge';
import oauth from 'mastercard-oauth1-signer';
import fetch from 'node-fetch';

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function loadSigningKeyPem() {
  const password = process.env.MASTERCARD_KEY_PASSWORD || 'keystorepassword';
  const alias = process.env.MASTERCARD_KEY_ALIAS || 'keyalias';

  let p12Content;
  if (process.env.MASTERCARD_P12_BASE64) {
    p12Content = Buffer.from(process.env.MASTERCARD_P12_BASE64, 'base64').toString('binary');
  } else if (process.env.MASTERCARD_P12_PATH) {
    p12Content = fs.readFileSync(process.env.MASTERCARD_P12_PATH, 'binary');
  } else {
    throw new Error('Set MASTERCARD_P12_PATH or MASTERCARD_P12_BASE64');
  }

  const p12Asn1 = forge.asn1.fromDer(p12Content, false);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

  let keyObj =
    p12.getBags({
      friendlyName: alias,
      bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    }).friendlyName?.[0] || null;

  if (!keyObj) {
    const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const list = bags[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
    keyObj = list[0] || null;
  }

  if (!keyObj?.key) {
    throw new Error(
      `Could not load private key from PKCS#12 (alias=${alias}). Check password/alias.`
    );
  }

  return forge.pki.privateKeyToPem(keyObj.key);
}

function mastercardBaseUrl() {
  const sandbox = process.env.MASTERCARD_SANDBOX !== 'false';
  return sandbox
    ? 'https://sandbox.api.mastercard.com/settlement/currencyrate'
    : 'https://api.mastercard.com/settlement/currencyrate';
}

/**
 * Fetch Mastercard network rate as BOB per 1 USD.
 * Query: spend BOB, bill USD → bob_per_usd = transAmt / crdhldBillAmt
 */
export async function fetchMastercardOfficialBobPerUsd() {
  const consumerKey = process.env.MASTERCARD_CONSUMER_KEY;
  if (!consumerKey) throw new Error('MASTERCARD_CONSUMER_KEY not set');

  const signingKey = loadSigningKeyPem();
  const fxDate = new Date().toISOString().slice(0, 10);
  const qs = new URLSearchParams({
    fxDate,
    transCurr: 'BOB',
    crdhldBillCurr: 'USD',
    bankFee: '0',
    transAmt: '100'
  });
  const uri = `${mastercardBaseUrl()}/conversion-rate?${qs.toString()}`;

  const authHeader = oauth.getAuthorizationHeader(uri, 'GET', null, consumerKey, signingKey);

  const res = await fetch(uri, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json'
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Mastercard API HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = JSON.parse(text);
  const data = json?.data || json;
  const bill = Number(data?.crdhldBillAmt);
  const rate = Number(data?.conversionRate);

  let bobPerUsd = null;
  if (Number.isFinite(bill) && bill > 0) {
    bobPerUsd = round4(100 / bill);
  } else if (Number.isFinite(rate) && rate > 0) {
    // conversionRate is typically USD per 1 BOB when billing USD
    bobPerUsd = round4(1 / rate);
  } else {
    throw new Error('Mastercard API response missing rate fields');
  }

  // Sandbox often returns outdated sample BOB (~6.8 era). Reject implausible prints.
  const sandbox = process.env.MASTERCARD_SANDBOX !== 'false';
  if (sandbox && (bobPerUsd < 8 || bobPerUsd > 25)) {
    throw new Error(
      `Mastercard sandbox rate ${bobPerUsd} looks like stale mock data (expected ~8–25 BOB/USD). Use production keys for live rates.`
    );
  }

  return {
    bobPerUsd,
    raw: json,
    source: sandbox ? 'mastercard-sandbox' : 'mastercard-api'
  };
}

export function hasMastercardCredentials() {
  return Boolean(
    process.env.MASTERCARD_CONSUMER_KEY &&
      (process.env.MASTERCARD_P12_PATH || process.env.MASTERCARD_P12_BASE64)
  );
}
