import { sourceObservationModel, observationLabel, formatObservationRate } from './sourceObservation.js';
import { SITE_URL } from '../config/brand.js';

// Preserve the observed time. Sharing a stored reading must never make it new.
export function rateShareModel(rate, language = 'es', now = Date.now()) {
  const es = language !== 'en';
  const model = sourceObservationModel(rate, now);
  const available = Boolean(model.buy && model.sell && model.observedAt && Date.parse(model.observedAt) <= now + 60_000);
  const url = `${SITE_URL}/${es ? '' : '?lang=en'}`;
  const title = es ? 'Dólar blue en Bolivia' : 'Bolivia blue dollar';
  const caveat = es ? 'Referencia digital P2P USDT/BOB; el efectivo puede cotizar distinto.' : 'Digital P2P USDT/BOB reference; physical cash quotes may differ.';
  const time = available ? observationLabel(model.observedAt, language) : (es ? 'Sin lectura fechada disponible' : 'No dated reading available');
  const status = available && model.stale ? (es ? 'LECTURA DESACTUALIZADA' : 'STALE READING') : '';
  const quote = available ? `${es ? 'Compra' : 'Buy'}: Bs ${formatObservationRate(model.buy)} · ${es ? 'Venta' : 'Sell'}: Bs ${formatObservationRate(model.sell)}` : '';
  return { ...model, available, url, title, time, status, quote, caveat,
    text: [title, quote, time, status, caveat, `Bolivia Blue · ${url}`].filter(Boolean).join('\n'),
  };
}
