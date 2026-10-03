import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FinancialOfferButton } from './FinancialOfferCard';
import CashOutGuide from './CashOutGuide';
import { calculateGuideConversion, guideMarketReference } from '../utils/guideConversion';
import { ELDORADO_GUIDE_CHECKED, ELDORADO_GUIDE_SOURCES } from '../data/eldoradoGuide';

export default function EldoradoMoneyGuide({ offer, direction, onDirectionChange, currentRate }) {
  const es = useLanguage()?.language !== 'en';
  const selling = direction === 'sell';
  const [values, setValues] = useState({ buy: { amount: '', price: '', deduction: '' }, sell: { amount: '', price: '', deduction: '' } });
  const [example, setExample] = useState({ buy: { price: false, deduction: false }, sell: { price: false, deduction: false } });
  const fields = values[direction];
  const result = calculateGuideConversion({ direction, ...fields });
  const reference = guideMarketReference(currentRate);
  const number = (value, digits = 2) => new Intl.NumberFormat(es ? 'es-BO' : 'en-US', { maximumFractionDigits: digits, minimumFractionDigits: 2 }).format(value);
  const outputUnit = selling ? 'BOB' : 'USDT';
  const update = (key, value) => {
    setValues((previous) => ({ ...previous, [direction]: { ...previous[direction], [key]: value } }));
    if (key === 'price' || key === 'deduction') setExample((previous) => ({ ...previous, [direction]: { ...previous[direction], [key]: false } }));
  };
  const loadExample = () => {
    setValues((previous) => ({ ...previous, [direction]: selling ? { amount: '100', price: '10', deduction: '10' } : { amount: '1000', price: '10', deduction: '1' } }));
    setExample((previous) => ({ ...previous, [direction]: { price: true, deduction: true } }));
  };
  const faq = es ? [
    ['¿Esto me da dólares en efectivo?', 'No. Comprás o vendés USDT, un criptoactivo que busca seguir al dólar. El saldo USDT no es efectivo USD ni un depósito bancario; su precio y sus riesgos pueden variar.'],
    ['¿Cómo retiro dinero de El Dorado a mi banco?', 'En esta guía significa vender USDT por BOB a través de P2P y recibir el pago en un método admitido. Es distinto de enviar criptomonedas a otra billetera por una red blockchain.'],
    ['¿Cuánto cobra y cuál es el mínimo?', 'Consultá la comisión y el mínimo/máximo del anuncio en la app. Dependen de la operación, el medio de pago y la verificación. Las transferencias o retiros por otras vías pueden tener costos separados.'],
    ['¿Necesito una cuenta bancaria?', 'No para registrarte. Para pagar o cobrar BOB necesitás un medio admitido para esa orden. Al comprar, usá una cuenta de pago a tu nombre.'],
    ['¿El QR de esta guía sirve para pagar en comercios?', 'Esta guía usa el QR de una orden P2P para transferir BOB desde tu banco. La Mini App de pagos QR que gasta tu saldo USDT es otra función.'],
  ] : [
    ['Does this give me USD cash?', 'No. You buy or sell USDT, a cryptoasset intended to track the dollar. USDT is not USD cash or a bank deposit; its price and risks can vary.'],
    ['How do I withdraw money from El Dorado to my bank?', 'Here, that means selling USDT for BOB through P2P and receiving payment through a supported method. It differs from sending crypto to another wallet over a blockchain network.'],
    ['What are the fees and minimum amount?', 'Check the fee and offer’s minimum/maximum in the app. They depend on the transaction, payment method and verification. Transfers or withdrawals through other channels may have separate costs.'],
    ['Do I need a bank account?', 'Not just to register. Paying or receiving BOB requires a supported method for that order. When buying, use a payment account in your own name.'],
    ['Is this QR the same as paying in shops?', 'This guide uses a P2P order’s QR to transfer BOB from your bank. The QR payments Mini App that spends your USDT balance is a different feature.'],
  ];
  return <div data-eldorado-guide={direction}>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{es ? 'El Dorado paso a paso: de BOB a USDT y de vuelta' : 'El Dorado step by step: BOB to USDT and back'}</h2>
    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{es ? 'Elegí lo que querés recibir. Cambiar el sentido cambia quién paga primero y cuándo se liberan los USDT.' : 'Choose what you want to receive. The direction changes who pays first and when USDT is released.'}</p>
    <div role="group" aria-label={es ? 'Dirección de la conversión' : 'Conversion direction'} className="mt-4 grid grid-cols-2 gap-2">
      {['buy', 'sell'].map((value) => <button type="button" key={value} aria-pressed={direction === value} onClick={() => onDirectionChange(value)}
        className={`min-w-0 min-h-[52px] rounded-xl border p-3 text-sm font-semibold ${direction === value ? 'bg-amber-400 border-amber-400 text-stone-950' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>{value === 'buy' ? (es ? 'Pago BOB → Recibo USDT' : 'Pay BOB → Receive USDT') : (es ? 'Vendo USDT → Recibo BOB' : 'Sell USDT → Receive BOB')}</button>)}
    </div>
    <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">{offer.guideLabel}</h3>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{offer.guideSummary}</p>
    <div className="mt-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 p-4 text-sm text-gray-700 dark:text-gray-200">
      <strong>{es ? 'Antes de empezar' : 'Before you start'}</strong>
      <p className="mt-1">{es ? 'Necesitás tener 18 años o más, completar la verificación de identidad y revisar el medio de pago de la orden. Si vas a vender, necesitás saldo USDT disponible. Seguí el plazo que muestra la orden; no hay una duración garantizada.' : 'You must be 18 or older, complete identity verification and check the order’s payment method. Selling requires available USDT. Follow the order’s displayed deadline; completion time is not guaranteed.'}</p>
    </div>
    <ol className="mt-6 space-y-5">{offer.steps.map(([title, body], index) => <li key={`${direction}-${index}`} className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800 dark:bg-sky-900 dark:text-sky-100">{index + 1}</span>
      <div className="min-w-0"><h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4><p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{body}</p></div>
    </li>)}</ol>
    <div className="mt-6 rounded-xl border border-amber-300 dark:border-amber-800 p-4 text-sm text-gray-700 dark:text-gray-200">
      <strong>{selling ? (es ? 'No liberes USDT por una captura de pantalla' : 'Do not release USDT based on a screenshot') : (es ? 'Si ya pagaste, no canceles sin reembolso' : 'If you have paid, do not cancel without a refund')}</strong>
      <p className="mt-2">{es ? 'Ante un pago faltante, importe distinto o sospecha, abrí la orden → Iniciar disputa y contactá al soporte dentro de la app. Conservá las pruebas. La custodia temporal retiene los USDT durante la orden, pero no elimina el riesgo de fraude o demoras.' : 'For missing payment, a different amount or anything suspicious, open the order → Start dispute and contact in-app support. Keep the evidence. Temporary escrow holds USDT during the order, but does not eliminate fraud or delays.'}</p>
    </div>
    <div className="mt-5">
      <FinancialOfferButton offer={offer} placement="buy_page_guide" />
      <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{offer.disclosure}</p>
    </div>
    <section className="mt-7 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 sm:p-5" aria-labelledby="guide-conversion-title">
      <h3 id="guide-conversion-title" className="text-lg font-bold text-gray-900 dark:text-white">{es ? 'Entendé la conversión antes de confirmar' : 'Understand the conversion before confirming'}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{es ? 'Copiá el precio de la oferta que elegiste, expresado en BOB por 1 USDT. Este cálculo no crea una orden ni envía el monto al proveedor.' : 'Copy your chosen offer’s price, expressed as BOB per 1 USDT. This calculation does not create an order or send the amount to the provider.'}</p>
      <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{selling ? (es ? 'USDT × precio BOB/USDT = BOB brutos' : 'USDT × BOB/USDT price = gross BOB') : (es ? 'BOB ÷ precio BOB/USDT = USDT brutos' : 'BOB ÷ BOB/USDT price = gross USDT')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-semibold text-gray-700 dark:text-gray-200">{selling ? (es ? 'USDT que venderías' : 'USDT you would sell') : (es ? 'BOB que pagarías' : 'BOB you would pay')}
          <input type="text" inputMode="decimal" autoComplete="off" value={fields.amount} onChange={(event) => update('amount', event.target.value)} className="mt-1 block w-full min-w-0 min-h-[44px] rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-3" />
        </label>
        <label className="min-w-0 text-sm font-semibold text-gray-700 dark:text-gray-200">{es ? 'Precio de tu oferta (BOB/USDT)' : 'Your offer price (BOB/USDT)'}
          <input type="text" inputMode="decimal" autoComplete="off" value={fields.price} onChange={(event) => update('price', event.target.value)} className="mt-1 block w-full min-w-0 min-h-[44px] rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-3" />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{es ? 'Ingresá números sin separadores de miles; punto o coma indican decimales.' : 'Enter numbers without thousands separators; a point or comma indicates decimals.'}</p>
      <label className="mt-4 block text-sm font-semibold text-gray-700 dark:text-gray-200">{es ? `Descuento adicional sobre lo recibido (${outputUnit}, opcional)` : `Additional deduction from what you receive (${outputUnit}, optional)`}
        <input type="text" inputMode="decimal" autoComplete="off" value={fields.deduction} onChange={(event) => update('deduction', event.target.value)} aria-describedby="guide-fee-help" className="mt-1 block w-full min-w-0 min-h-[44px] rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-3" />
      </label>
      <p id="guide-fee-help" className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{es ? `Solo ingresá un cargo si la app lo descuenta de lo recibido en ${outputUnit} y no está incluido en el precio. No lo restes dos veces. Si se cobra en otra moneda o del monto enviado, usá los totales finales de la app.` : `Enter a charge only if the app deducts it from what you receive in ${outputUnit} and it is not included in the price. Do not subtract it twice. If charged in another currency or from the amount sent, use the app’s final totals.`}</p>
      <div className="mt-4 rounded-lg bg-white dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-200 break-words" aria-live="polite" data-guide-result>
        {result.valid ? <>
          <p>{number(result.input, 4)} {result.inputUnit} {selling ? '×' : '÷'} {number(result.price, 4)} BOB/USDT ≈ <strong>{number(result.gross, selling ? 2 : 4)} {outputUnit}</strong> {es ? 'brutos' : 'gross'}</p>
          {result.net === null ? <p className="mt-2">{es ? 'Falta comprobar las comisiones: esto no es un monto neto.' : 'Fees still need checking: this is not a net amount.'}</p> : <>
            <p className="mt-2">{es ? 'Después del descuento ingresado' : 'After your entered deduction'}: ≈ <strong>{number(result.net, selling ? 2 : 4)} {outputUnit}</strong></p>
            {result.effectiveRate !== null && <p className="mt-2 text-xs">{es ? 'Precio efectivo de este cálculo' : 'Effective price in this calculation'}: {number(result.effectiveRate, 4)} BOB/USDT</p>}
          </>}
        </> : <p>{result.reason === 'deduction' ? (es ? 'El descuento debe ser un número desde 0 hasta el monto bruto recibido.' : 'The deduction must be a number from 0 up to the gross amount received.') : (es ? 'Ingresá un monto y un precio mayores que cero para ver el cálculo.' : 'Enter an amount and price greater than zero to see the calculation.')}</p>}
      </div>
      <button type="button" onClick={loadExample} className="mt-3 min-h-[44px] py-2 text-left text-sm font-semibold text-sky-700 dark:text-sky-300 underline">{es ? 'Cargar ejemplo didáctico con precio 10 BOB/USDT' : 'Load a learning example at 10 BOB/USDT'}</button>
      {(example[direction].price || example[direction].deduction) && <p className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">{es ? 'Hay un precio o cargo del ejemplo didáctico. No es una cotización actual ni una tarifa de El Dorado.' : 'A hypothetical price or fee from the example remains. It is not a current quote or El Dorado fee.'}</p>}
      {reference.midpoint !== null && <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400" data-guide-reference>{es ? 'Comparación separada: punto medio del mercado' : 'Separate comparison: market midpoint'} ≈ {number(reference.midpoint, 4)} BOB/USDT. {es ? 'No es el precio de tu orden ni una oferta ejecutable de El Dorado.' : 'It is not your order price or an executable El Dorado offer.'} {reference.stale && <strong>{es ? 'Referencia anterior; verificá la app.' : 'Older reference; check the app.'}</strong>} {reference.updatedAt && <time dateTime={reference.updatedAt}>{new Date(reference.updatedAt).toLocaleString(es ? 'es-BO' : 'en-US', { timeZone: 'America/La_Paz' })}</time>}</p>}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{es ? 'Para comparar el costo real al comprar: BOB totales pagados ÷ USDT netos recibidos. Al vender: BOB netos recibidos ÷ USDT totales debitados. Revisá también cargos bancarios y de red.' : 'To compare the actual buying cost: total BOB paid ÷ net USDT received. When selling: net BOB received ÷ total USDT debited. Check bank and network charges too.'}</p>
    </section>
    <CashOutGuide onShowSell={() => {
      onDirectionChange('sell');
      document.getElementById('guia')?.scrollIntoView({ block: 'start' });
    }} />
    <section className="mt-7">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{es ? 'Dudas antes de tu primera operación' : 'Questions before your first trade'}</h3>
      {faq.map(([question, answer]) => <details key={question} className="mt-2 border-b border-gray-200 dark:border-gray-700 py-2"><summary className="cursor-pointer py-2 text-sm font-semibold text-gray-900 dark:text-white">{question}</summary><p className="pb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{answer}</p></details>)}
    </section>
    <div className="mt-6 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
      <p>{es ? 'Fuentes oficiales consultadas' : 'Official sources checked'}: <time dateTime={ELDORADO_GUIDE_CHECKED}>{es ? '3 de octubre de 2026' : 'October 3, 2026'}</time>. {es ? 'La app y sus condiciones pueden cambiar.' : 'App screens and terms can change.'}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{ELDORADO_GUIDE_SOURCES.map(([key, spanish, english, href]) => <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="underline">{es ? spanish : english}</a>)}</div>
    </div>
  </div>;
}
