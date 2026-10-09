/** Conversion guidance shared only by the “how much” route and its initial HTML. */
export function getCuantoConversionGuide(language = 'es') {
  const en = language === 'en';
  return {
    heading: en ? 'Estimate dollars in bolivianos' : 'Estimar dólares en bolivianos',
    buyLabel: en ? 'P2P buy (you buy USDT)' : 'Compra P2P (compras USDT)',
    sellLabel: en ? 'P2P sell (you sell USDT)' : 'Venta P2P (vendes USDT)',
    unit: en ? 'BOB per USDT' : 'BOB por USDT',
    explanation: en
      ? 'To estimate how many bolivianos you would receive, the calculator multiplies the amount by the P2P sell rate. To convert BOB to dollars, it divides by the buy rate. The USD/BOB estimate assumes 1 USD = 1 USDT, before fees; it does not guarantee a cash quote.'
      : 'Para estimar cuántos bolivianos recibirías, la calculadora multiplica el monto por la tasa de venta P2P. Para convertir BOB a dólares, divide por la tasa de compra. La estimación USD/BOB supone 1 USD = 1 USDT, antes de comisiones; no garantiza una cotización de efectivo.',
    presets: [100, 1000].map((amount) => ({
      amount,
      href: `/calculadora?usd=${amount}${en ? '&lang=en' : ''}`,
      label: en ? `Estimate ${amount} USD in BOB` : `Estimar ${amount} USD en BOB`,
    })),
  };
}
