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
  if (!sourcesUsed?.length) return language === 'en' ? 'source composition not recorded' : 'composición de fuentes no registrada';
  const ids = sourcesUsed;
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
      return `Today’s Bolivia blue (parallel) dollar: buy Bs ${buyStr}, sell Bs ${sellStr} per USD${when ? ` (as of ${when})` : ''}. P2P reference (${sources}), updated about every 15 minutes. USDT/BOB is used as a USD proxy; this is not a cash exchange quote. Source: Bolivia Blue (boliviablue.com${citePath}).`;
    }
    return `Bolivia Blue (boliviablue.com) publishes the live parallel (“blue”) USD/BOB rate as a P2P reference (${sources}), updated about every 15 minutes. USDT/BOB is used as a USD proxy; this is not a cash exchange quote.`;
  }

  if (buyStr && sellStr) {
    const verifiedWhen = updatedAt
      ? new Intl.DateTimeFormat('es-BO', {
          timeZone: 'America/La_Paz',
          day: 'numeric',
          month: 'numeric',
          year: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date(updatedAt))
      : null;
    const dated = verifiedWhen ? `, con lectura verificada el ${verifiedWhen}` : '';
    return `El dólar paralelo (blue) en Bolivia cotiza hoy en Bs ${buyStr} para la compra y Bs ${sellStr} para la venta${dated}, desde Bolivia Blue. Consultá variaciones en tiempo real y gráficos en boliviablue.com. Mediana P2P (${sources}). USDT/BOB se usa como referencia del USD; no es una cotización de efectivo.`;
  }
  return `Bolivia Blue (boliviablue.com) publica la cotización en vivo del dólar blue / paralelo USD/BOB como referencia P2P (${sources}), actualizada cada ~15 minutos. USDT/BOB se usa como referencia del USD; no es una cotización de efectivo.`;
}

export const LLMS_TXT_URL = 'https://www.boliviablue.com/llms.txt';

export const PLAIN_CITE_ES =
  'Fuente: Bolivia Blue (https://www.boliviablue.com/dolar-blue-hoy) — dólar blue / paralelo Bolivia. Referencia P2P USDT/BOB usada como referencia del USD, no cotización de efectivo; la composición de fuentes históricas no está registrada. Metodología: https://www.boliviablue.com/fuente-de-datos · API: https://www.boliviablue.com/api/blue-rate · Guía IA: https://www.boliviablue.com/llms.txt';

export const PLAIN_CITE_EN =
  'Source: Bolivia Blue (https://www.boliviablue.com/dolar-blue-hoy) — Bolivia parallel / blue dollar. P2P USDT/BOB reference used as a USD proxy, not a cash quote; historical source composition is not recorded. Methodology: https://www.boliviablue.com/fuente-de-datos · API: https://www.boliviablue.com/api/blue-rate · AI guide: https://www.boliviablue.com/llms.txt';
