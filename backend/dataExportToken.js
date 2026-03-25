/**
 * Signed tokens for extended historical CSV/JSON exports (90d, 1y, all).
 * Set DATA_EXPORT_HMAC_SECRET in production (min 24 chars).
 */

import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getExportTokenSecret() {
  const s = process.env.DATA_EXPORT_HMAC_SECRET;
  if (s && String(s).length >= 24) return s;
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-data-export-hmac-min-24-chars!!';
  }
  return null;
}

export function isExportTokenSigningConfigured() {
  return getExportTokenSecret() != null;
}

function signPayload(payloadB64) {
  const secret = getExportTokenSecret();
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

/**
 * @param {string} email
 * @returns {string|null}
 */
export function signDataExportToken(email) {
  const normalized = String(email).toLowerCase().trim();
  const exp = Date.now() + TOKEN_TTL_MS;
  const payloadB64 = Buffer.from(JSON.stringify({ e: normalized, exp }), 'utf8').toString('base64url');
  const sig = signPayload(payloadB64);
  if (!sig) return null;
  return `${payloadB64}.${sig}`;
}

/**
 * @param {string} token
 * @returns {{ email: string, exp: number } | null}
 */
export function verifyDataExportToken(token) {
  if (!token || typeof token !== 'string') return null;
  const secret = getExportTokenSecret();
  if (!secret) return null;

  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payloadB64 || !sig) return null;

  const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed.e !== 'string' || typeof parsed.exp !== 'number') return null;
  if (parsed.exp < Date.now()) return null;

  return { email: parsed.e, exp: parsed.exp };
}
