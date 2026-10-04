import { useEffect, useState } from 'react';
import { calculatePaymentCosts, formatPaymentCents, paymentRatePreview, PAYMENT_COST_DEFAULTS, PAYMENT_COST_EXAMPLE } from '../utils/paymentCosts.js';

export default function PaymentCostChecker({ language = 'es' }) {
  const es = language !== 'en';
  const [inputs, setInputs] = useState(() => ({ ...PAYMENT_COST_DEFAULTS }));
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState({});
  const [mode, setMode] = useState('manual');
  const [announcement, setAnnouncement] = useState('');
  const result = calculatePaymentCosts(inputs);
  const visibleResult = attempted && result.valid;
  const ratePreview = paymentRatePreview(inputs.rate);
  const money = (value) => formatPaymentCents(value, language);
  const decimal = (value) => es ? value.replace('.', ',') : value;
  const copy = {
    title: es ? '¿Pagar en bolivianos o dólares?' : 'Pay in bolivianos or dollars?',
    intro: es ? 'Compará dos precios para la misma compra con la tasa y las comisiones que ingreses.' : 'Compare two prices for the same purchase using the rate and fees you enter.',
    samePurchase: es ? 'Usá la misma cantidad, impuestos y conceptos en ambos precios. Comparamos tu presupuesto en USD; el comercio y tu proveedor deben confirmar si podés usar cada método.' : 'Use the same quantity, taxes and purchase components in both prices. We compare your budget in USD; the merchant and your provider must confirm whether each method is available.',
    bobPrice: es ? 'Precio en bolivianos (BOB)' : 'Price in bolivianos (BOB)',
    usdPrice: es ? 'Precio alternativo en dólares (USD)' : 'Alternative price in dollars (USD)',
    rate: es ? 'Tu tasa de conversión (BOB por USD)' : 'Your conversion rate (BOB per USD)',
    rateHint: es ? 'Cuántos bolivianos obtenés por USD 1, antes de las comisiones adicionales de abajo. La tasa puede incluir el margen del proveedor. Si ya incluye una comisión, no la agregues otra vez.' : 'How many bolivianos USD 1 converts to, before the extra fees below. The rate may include the provider’s markup. If it already includes a fee, don’t add that fee again.',
    numberHint: es ? 'Usá punto o coma decimal. No uses separadores de miles.' : 'Use a decimal point or comma. Don’t use thousands separators.',
    percent: es ? 'Comisión adicional (%)' : 'Additional fee (%)',
    fixed: es ? 'Comisión fija adicional (USD)' : 'Additional fixed fee (USD)',
    feeHint: es ? 'Dejá vacío o en 0 si no aplica. Agregá solo cargos que no estén incluidos en el precio o la tasa.' : 'Leave blank or enter 0 if none. Only add charges not already included in the price or rate.',
    bobFees: es ? 'Cargos al pagar en BOB' : 'Fees when paying in BOB',
    usdFees: es ? 'Cargos al pagar en USD' : 'Fees when paying in USD',
    compare: es ? 'Comparar costos' : 'Compare costs',
    example: es ? 'Ver ejemplo hipotético' : 'Try a hypothetical example',
    clear: es ? 'Borrar datos' : 'Clear inputs',
    empty: es ? 'Ingresá ambos precios y tu tasa para comparar.' : 'Enter both prices and your rate to compare.',
    unsupported: es ? 'Este navegador no admite el cálculo exacto. Abrí la guía en un navegador actualizado para usar el comparador.' : 'This browser does not support exact calculations. Open the guide in an updated browser to use the checker.',
    invalid: es ? 'Revisá los campos indicados para calcular de nuevo.' : 'Check the highlighted fields to calculate again.',
    limit: es ? 'El total supera el límite de USD 1.000.000.000. Revisá los importes y la tasa; no mostramos un resultado recortado.' : 'The total exceeds the USD 1,000,000,000 limit. Check the amounts and rate; we do not show a capped result.',
    disclosure: es ? 'Cálculo orientativo con tus datos. No obtenemos cotizaciones de efectivo ni de tarjetas. Confirmá el precio, las comisiones y el método de pago antes de pagar.' : 'An estimate using your inputs. We don’t obtain cash or card quotes. Confirm the price, fees and payment method before paying.',
    privacy: es ? 'Estos datos quedan en este comparador mientras la página está abierta. No se guardan ni se envían desde la herramienta.' : 'These inputs stay in this checker while the page is open. The tool does not save or send them.',
  };
  const summary = !visibleResult ? '' : result.cheaper === 'tie'
    ? (es ? 'Mismo costo estimado al centavo.' : 'Same estimated cost to the nearest cent.')
    : (es ? `Con estos datos, pagar en ${result.cheaper.toUpperCase()} cuesta USD ${money(result.differenceCents)} menos.` : `With these inputs, paying in ${result.cheaper.toUpperCase()} costs USD ${money(result.differenceCents)} less.`);
  const status = result.status === 'unsupported' ? copy.unsupported : attempted ? (visibleResult ? summary : result.status === 'out_of_range' ? copy.limit : result.status === 'incomplete' ? copy.empty : copy.invalid) : '';
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(status), 350);
    return () => clearTimeout(timer);
  }, [status]);

  function update(field, value) {
    setInputs((previous) => ({ ...previous, [field]: value }));
    if (mode === 'example') setMode('edited');
  }
  function reset() {
    setInputs({ ...PAYMENT_COST_DEFAULTS });
    setAttempted(false);
    setTouched({});
    setMode('manual');
  }
  function errorText(field, error) {
    if (error === 'required') return es ? 'Completá este campo.' : 'Enter a value.';
    if (error === 'positive') return es ? 'Ingresá un valor mayor que 0.' : 'Enter a value greater than 0.';
    if (error === 'percentage') return es ? 'Este modelo admite comisiones entre 0 y 100%.' : 'This model supports fees from 0 to 100%.';
    if (error === 'precision') return field === 'rate'
      ? (es ? 'Usá hasta 6 decimales para la tasa.' : 'Use up to 6 decimal places for the rate.')
      : (es ? 'Usá hasta 2 decimales.' : 'Use up to 2 decimal places.');
    if (error === 'range') return es ? 'Máximo: 1.000.000; hasta 32 caracteres por campo.' : 'Maximum: 1,000,000; up to 32 characters per field.';
    return es ? 'Ingresá solo números no negativos y un separador decimal; sin símbolos, miles ni exponentes.' : 'Enter only non-negative digits and one decimal separator; no symbols, grouping or exponents.';
  }
  const field = (key, label, hintId = 'payment-cost-number-hint') => {
    const error = (attempted || touched[key]) && result.errors?.[key];
    const id = `payment-cost-${key}`;
    return <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900 dark:text-white">{label}</label>
      <input id={id} type="text" inputMode="decimal" autoComplete="off"
        required={['bobPrice', 'usdPrice', 'rate'].includes(key)} value={inputs[key]} onChange={(event) => update(key, event.target.value)} onBlur={() => setTouched((previous) => ({ ...previous, [key]: true }))}
        aria-invalid={Boolean(error)} aria-describedby={`${hintId}${error ? ` ${id}-error` : ''}`}
        className="mt-2 min-h-[44px] w-full min-w-0 rounded-lg border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 px-3 py-2 text-base font-mono text-gray-900 dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600" />
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">{errorText(key, error)}</p>}
    </div>;
  };
  const buttonClass = 'min-h-[44px] rounded-lg border border-gray-400 dark:border-gray-500 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600';

  return <section id="payment-cost-comparison" data-payment-cost-checker className="google-anno-skip mt-8 scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] min-w-0 rounded-2xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
    <h2 id="payment-cost-title" className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h2>
    <p className="mt-3 text-gray-700 dark:text-gray-300">{copy.intro}</p>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{copy.samePurchase}</p>
    {mode !== 'manual' && <p data-scenario-label className="mt-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 font-semibold text-amber-900 dark:text-amber-200">{mode === 'example' ? (es ? 'Ejemplo hipotético' : 'Hypothetical example') : (es ? 'Tu escenario editado' : 'Your edited scenario')}. {es ? 'No es una cotización verificada.' : 'This is not a verified quote.'}</p>}
    <form noValidate autoComplete="off" aria-labelledby="payment-cost-title" onSubmit={(event) => { event.preventDefault(); setAttempted(true); }} className="mt-5 space-y-5">
      <p id="payment-cost-number-hint" className="text-sm text-gray-600 dark:text-gray-300">{copy.numberHint}</p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{field('bobPrice', copy.bobPrice)}{field('usdPrice', copy.usdPrice)}</div>
      <div>
        {field('rate', copy.rate, 'payment-cost-number-hint payment-cost-rate-hint')}
        <p id="payment-cost-rate-hint" className="mt-2 text-sm text-gray-600 dark:text-gray-300">{copy.rateHint}</p>
        {ratePreview && <p data-rate-preview className="mt-2 break-words font-mono text-sm text-gray-900 dark:text-white">USD 1 → Bs {decimal(ratePreview)}</p>}
      </div>
      <p id="payment-cost-fee-hint" className="text-sm text-gray-600 dark:text-gray-300">{copy.feeHint}</p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{[['bob', copy.bobFees], ['usd', copy.usdFees]].map(([route, legend]) => <fieldset key={route} className="min-w-0 space-y-4 rounded-xl border border-gray-300 dark:border-gray-600 p-4">
        <legend className="px-1 text-sm font-bold text-gray-900 dark:text-white">{legend}</legend>
        {field(`${route}Percent`, copy.percent, 'payment-cost-number-hint payment-cost-fee-hint')}
        {field(`${route}Fixed`, copy.fixed, 'payment-cost-number-hint payment-cost-fee-hint')}
      </fieldset>)}</div>
      <details className="text-sm text-gray-700 dark:text-gray-300">
        <summary className="min-h-[44px] cursor-pointer py-3 font-semibold">{es ? 'Cómo calculamos y límites de la herramienta' : 'Calculation method and tool limits'}</summary>
        <div className="mt-2 space-y-2">
          <p>{es ? 'Cada comisión porcentual se aplica al importe base en USD de esa opción. La comisión fija en USD se suma después. Las comisiones no se aplican unas sobre otras.' : 'Each percentage fee applies to that option’s base USD amount. The fixed USD fee is added afterward. Fees aren’t compounded.'}</p>
          <p className="break-words font-mono">{es ? 'Costo BOB en USD' : 'BOB cost in USD'} = (BOB ÷ (BOB/USD)) × (1 + %/100) + {es ? 'cargo fijo USD' : 'fixed USD fee'}</p>
          <p className="break-words font-mono">{es ? 'Costo USD' : 'USD cost'} = USD × (1 + %/100) + {es ? 'cargo fijo USD' : 'fixed USD fee'}</p>
          <p>{es ? 'Redondeamos cada total una sola vez al centavo más cercano; medio centavo se redondea hacia arriba. La suma de los importes mostrados por separado puede diferir un centavo. Tu proveedor puede redondear de otra manera.' : 'We round each total once to the nearest cent; half a cent rounds up. Separately displayed line items may differ by a cent when added. Your provider may round differently.'}</p>
          <p>{es ? 'No calculamos comisiones mínimas, escalonadas, sobre otras comisiones, intereses, adelantos de efectivo ni varios retiros. Si conocés un cargo adicional exacto en USD, ingresalo como fijo y poné su porcentaje en 0.' : 'We do not model minimum, tiered or fee-on-fee charges, interest, cash advances or multiple withdrawals. If you know an exact additional USD fee, enter it as fixed and set its percentage to 0.'}</p>
          <p>{es ? 'Límites: precios y cargos fijos hasta 1.000.000; tasas de 0,000001 a 1.000.000 BOB/USD; porcentajes de 0 a 100%. Hasta 2 decimales en importes y porcentajes, 6 en la tasa y 32 caracteres por campo. Total máximo: USD 1.000.000.000.' : 'Limits: prices and fixed fees up to 1,000,000; rates from 0.000001 to 1,000,000 BOB/USD; percentages from 0 to 100%. Up to 2 decimal places for amounts and percentages, 6 for the rate and 32 characters per field. Maximum total: USD 1,000,000,000.'}</p>
        </div>
      </details>
      <div className="flex min-w-0 flex-wrap gap-3">
        <button type="submit" className="min-h-[44px] rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600">{copy.compare}</button>
        <button type="button" className={buttonClass} onClick={() => { setInputs({ ...PAYMENT_COST_EXAMPLE }); setAttempted(true); setTouched({}); setMode('example'); }}>{copy.example}</button>
        <button type="button" className={buttonClass} onClick={reset}>{copy.clear}</button>
      </div>
    </form>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    {visibleResult ? <div data-payment-cost-results className="mt-6 space-y-4">
      <p data-cost-summary className="rounded-xl bg-sky-50 dark:bg-sky-950/30 p-4 font-bold text-gray-900 dark:text-white">{summary}</p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{[['bob', result.bob], ['usd', result.usd]].map(([route, values]) => <section key={route} className="min-w-0 rounded-xl border border-gray-300 dark:border-gray-600 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white">{es ? 'Pagar en ' : 'Pay in '}{route.toUpperCase()}</h3>
        <dl className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">{[
          ['base', es ? 'Importe base en USD' : 'Base amount in USD'],
          ['percentage', es ? 'Comisión porcentual en USD' : 'Percentage fee in USD'],
          ['fixed', es ? 'Comisión fija en USD' : 'Fixed fee in USD'],
          ['total', es ? 'Total estimado en USD' : 'Estimated total in USD'],
        ].map(([key, label]) => <div key={key} className={key === 'total' ? 'border-t border-gray-300 dark:border-gray-600 pt-3 font-bold' : ''}><dt>{label}</dt><dd data-cost-value={`${route}-${key}`} className="mt-1 break-all font-mono tabular-nums">USD {money(values[key])}</dd></div>)}</dl>
      </section>)}</div>
      <div data-break-even className="text-sm text-gray-700 dark:text-gray-300">
        <h3 className="font-semibold">{es ? 'Tasa de equilibrio antes del redondeo al centavo' : 'Break-even rate before rounding to cents'}</h3>
        {result.breakEven.kind === 'value' ? <><p className="mt-1 break-words font-mono">{result.breakEven.approximate ? '≈ ' : ''}{decimal(result.breakEven.value)} BOB/USD</p><p className="mt-1">{es ? 'Con los demás datos fijos, una tasa mayor reduce el costo en USD de pagar en BOB. Este umbral es algebraico; el resultado de arriba compara los totales redondeados.' : 'With the other inputs unchanged, a higher rate reduces the USD cost of paying in BOB. This is an algebraic threshold; the result above compares rounded totals.'}</p></>
          : <p className="mt-1">{result.breakEven.kind === 'none'
            ? (es ? 'No hay una tasa de equilibrio positiva y finita: la comisión fija de la opción en BOB ya es igual o mayor que el costo total de la opción en USD.' : 'There is no finite positive break-even rate: the BOB option’s fixed fee is already at least the USD option’s total.')
            : result.breakEven.kind === 'below_range' ? (es ? 'El equilibrio es positivo pero menor que 0,000001 BOB/USD; queda fuera del rango mostrado.' : 'The break-even rate is positive but below 0.000001 BOB/USD, outside the displayed range.')
            : (es ? 'La tasa de equilibrio supera 1.000.000 BOB/USD; queda fuera del rango mostrado.' : 'The break-even rate exceeds 1,000,000 BOB/USD, outside the displayed range.')}</p>}
      </div>
    </div> : <p data-cost-empty className="mt-5 text-sm text-gray-700 dark:text-gray-300">{attempted || result.status === 'unsupported' ? status : copy.empty}</p>}
    <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">{copy.disclosure}</p>
    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{copy.privacy}</p>
    <nav aria-label={es ? 'Fuentes sobre conversión y cargos' : 'Sources on conversion and fees'} className="mt-4 flex flex-wrap gap-4 text-sm">
      <a href="https://www.visa.com/en-us/personal/travel/dynamic-currency-conversion" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sky-700 dark:text-sky-300 underline">{es ? 'Visa: elegir la moneda de pago' : 'Visa: choosing a payment currency'}</a>
      <a href="https://caribbean.mastercard.com/content/mastercardcom/en-region-car/en/personal/get-support/convert-currency.html" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sky-700 dark:text-sky-300 underline">{es ? 'Mastercard: conversión y cargo bancario' : 'Mastercard: conversion and bank fee'}</a>
    </nav>
  </section>;
}
