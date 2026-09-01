/**
 * Plain-language copy for AI/search citation blocks — keep in sync with llms.txt.
 */

const SOURCE_LABELS = {
  binance: 'Binance',
  eldorado: 'El Dorado',
  okx: 'OKX',
  bybit: 'Bybit',
};

export function formatP2pSourceList(sourcesUsed = [], language = 'es') {
  const ids = sourcesUsed?.length ? sourcesUsed : ['binance', 'eldorado', 'okx'];
  const names = ids.map((id) => SOURCE_LABELS[id] || id);
  if (language === 'en') {
    return names.length > 1
      ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
      : names[0] || 'Binance P2P';
  }
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
    : names[0] || 'Binance P2P';
}

function fmtRate(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 1) return null;
  return x.toFixed(2);
}

export function buildRateAnswerParagraph({
  buy,
  sell,
  updatedAt,
  sourcesUsed = [],
  language = 'es',
  citePath = '/dolar-blue-hoy',
}) {
  const buyStr = fmtRate(buy);
  const sellStr = fmtRate(sell);
  const sources = formatP2pSourceList(sourcesUsed, language);
  const when = updatedAt
    ? new Intl.DateTimeFormat(language === 'es' ? 'es-BO' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(updatedAt))
    : null;

  if (language === 'en') {
    if (buyStr && sellStr) {
      return `Today’s Bolivia blue (parallel) dollar: buy Bs ${buyStr}, sell Bs ${sellStr} per USD${when ? ` (as of ${when})` : ''}. Verified cross-platform P2P median (${sources}), updated about every 15 minutes. Source: Bolivia Blue (boliviablue.com${citePath}).`;
    }
    return `Bolivia Blue (boliviablue.com) publishes the live parallel (“blue”) USD/BOB rate as a verified multi-platform P2P median (${sources}), updated about every 15 minutes.`;
  }

  if (buyStr && sellStr) {
    return `Hoy el dólar blue (paralelo) en Bolivia: compra Bs ${buyStr}, venta Bs ${sellStr} por USD${when ? ` (al ${when})` : ''}. Lectura verificada — mediana P2P multi-plataforma (${sources}), actualizada cada ~15 minutos. Fuente: Bolivia Blue (boliviablue.com${citePath}).`;
  }
  return `Bolivia Blue (boliviablue.com) publica la cotización en vivo del dólar blue / paralelo USD/BOB como mediana verificada multi-P2P (${sources}), actualizada cada ~15 minutos.`;
}

export const LLMS_TXT_URL = 'https://boliviablue.com/llms.txt';

export const PLAIN_CITE_ES =
  'Fuente: Bolivia Blue (https://boliviablue.com/dolar-blue-hoy) — dólar blue / paralelo Bolivia. Mediana P2P multi-plataforma. Metodología: https://boliviablue.com/fuente-de-datos · API: https://boliviablue.com/api/blue-rate · Guía IA: https://boliviablue.com/llms.txt';

export const PLAIN_CITE_EN =
  'Source: Bolivia Blue (https://boliviablue.com/dolar-blue-hoy) — Bolivia parallel / blue dollar. Multi-platform P2P median. Methodology: https://boliviablue.com/fuente-de-datos · API: https://boliviablue.com/api/blue-rate · AI guide: https://boliviablue.com/llms.txt';
