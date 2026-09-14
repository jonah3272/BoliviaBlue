function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 1) return null;
  return x.toFixed(2);
}

function renderBadgeSvg(buy, sell) {
  const buyStr = fmt(buy) || '—';
  const sellStr = fmt(sell) || '—';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="40" viewBox="0 0 320 40" role="img" aria-label="Bolivia Blue live rate">
  <rect width="320" height="40" rx="8" fill="#0f172a"/>
  <text x="12" y="26" fill="#ffffff" font-family="system-ui,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="700">Bolivia Blue</text>
  <text x="128" y="26" fill="#93c5fd" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13">C ${escapeXml(buyStr)} · V ${escapeXml(sellStr)}</text>
</svg>`;
}

module.exports = { escapeXml, fmt, renderBadgeSvg };
