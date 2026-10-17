/** Copy only: the homepage keeps its existing buy-side calculation. */
export function homeConversionCopy(language = 'es') {
  return language === 'es' ? {
    prefix: 'Comprar 100 USDT: pagarías ≈',
    note: 'Referencia P2P USDT/BOB, antes de comisiones; no es una cotización de dólares en efectivo.',
  } : {
    prefix: 'Buy 100 USDT: you would pay ≈',
    note: 'USDT/BOB P2P reference, before fees; not a quote for cash dollars.',
  };
}
