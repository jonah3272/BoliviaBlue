/** Stable guide metadata: a changing or unavailable quote is not a live-rate promise. */
export function travelerGuideMeta(language = 'es') {
  return language === 'en' ? {
    title: 'Bolivia Money Guide for Travelers 2026 | Bolivia Blue',
    description: 'Cash, cards and ATMs in Bolivia. P2P USDT/BOB reference: check the observation time and availability. Not a cash quote.',
  } : {
    title: 'Guía de dinero para viajeros en Bolivia 2026 | Bolivia Blue',
    description: 'Efectivo, tarjetas y cajeros en Bolivia. Referencia P2P USDT/BOB: consultá la hora de lectura y su disponibilidad. No es cotización de efectivo.',
  };
}
