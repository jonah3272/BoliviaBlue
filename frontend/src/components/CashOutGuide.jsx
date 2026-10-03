import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DEPOSIT_HELP = 'https://faq.eldorado.io/en/articles/12335498-how-to-deposit-funds-in-el-dorado';
const CURRENT_ADDRESS_HELP = 'https://eldorado.io/blog/cambiaron-direcciones-de-deposito-en-el-dorado';
const BANK_TARIFF_EXAMPLE = 'https://www.bcp.com.bo/Tarifario/Tarjetas_de_Debito_Tarifario';

export default function CashOutGuide({ onShowSell }) {
  const es = useLanguage()?.language !== 'en';
  const [cashCurrency, setCashCurrency] = useState('BOB');
  const wantsUsd = cashCurrency === 'USD';
  const route = es
    ? ['USDT en El Dorado', 'Venta por BOB', 'Tu cuenta bancaria', 'Cajero o ventanilla', 'Efectivo BOB']
    : ['USDT in El Dorado', 'Sell for BOB', 'Your bank account', 'ATM or branch', 'BOB cash'];
  if (wantsUsd) route.push(es ? 'Cambio separado a billetes USD' : 'Separate exchange for USD notes');
  const steps = es ? [
    ['Elegí dónde vas a cobrar', 'Antes de mover USDT, confirmá que podés recibir BOB en tu propia cuenta y retirar efectivo. Consultá requisitos, límites y cargos del banco.'],
    ['Revisá cualquier depósito desde otra billetera', 'Si tus USDT están fuera de El Dorado, copiá la dirección vigente desde la app en cada envío. Comprobá token, red y mínimo. Una prueba pequeña debe superar ese mínimo y también puede tener comisión. No uses una dirección enviada por chat o correo.'],
    ['Vendé USDT por BOB', 'Elegí Tengo USDT → Quiero BOB y un medio de cobro admitido. Comprobá comprador, condiciones y monto neto antes de crear la orden.'],
    ['Verificá el dinero antes de liberar', 'Abrí tu banco y comprobá la acreditación completa. Un mensaje o comprobante no basta. Solo después confirmá y liberá USDT; ante diferencias o presión, usá la disputa en la app.'],
    ['Retirá el efectivo', 'Con los BOB acreditados, usá un cajero o ventanilla según las reglas y disponibilidad de tu banco. Confirmá cuánto efectivo recibirás y cuánto se debitará en total, incluidos los cargos. El Dorado no entrega esos billetes.'],
  ] : [
    ['Choose where you will receive payment', 'Before moving USDT, confirm that you can receive BOB in your own account and withdraw cash. Check the bank’s requirements, limits and fees.'],
    ['Check any deposit from another wallet', 'If your USDT is outside El Dorado, copy the current address from the app for each transfer. Match token, network and minimum. A small test must exceed that minimum and may also cost a fee. Do not use an address sent by chat or email.'],
    ['Sell USDT for BOB', 'Choose I have USDT → I want BOB and a supported receiving method. Check the buyer, terms and net amount before creating the order.'],
    ['Verify the money before releasing', 'Open your bank app and check the full credit. A message or receipt is not enough. Only then confirm and release USDT; use an in-app dispute for discrepancies or pressure.'],
    ['Withdraw the cash', 'Once BOB is credited, use an ATM or branch under your bank’s rules and availability. Check how much cash you will receive and the total account debit, including fees. El Dorado does not hand over those banknotes.'],
  ];
  return <section className="mt-7 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/20 p-4 sm:p-5" aria-labelledby="cash-out-title" data-cash-currency={cashCurrency}>
    <h3 id="cash-out-title" className="text-xl font-bold text-gray-900 dark:text-white">{es ? '¿Y después? Cómo terminar con efectivo' : 'What next? Turning your balance into cash'}</h3>
    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{es ? 'Tener USDT en una app no es tener billetes. La ruta bancaria tiene dos partes: vender USDT por BOB y después retirar esos BOB.' : 'USDT in an app is not cash in hand. The bank route has two parts: sell USDT for BOB, then withdraw those BOB.'}</p>
    <div role="group" aria-label={es ? 'Moneda del efectivo que querés' : 'Cash currency you want'} className="mt-4 grid grid-cols-2 gap-2">
      {['BOB', 'USD'].map((currency) => <button key={currency} type="button" aria-pressed={currency === cashCurrency} onClick={() => setCashCurrency(currency)} className={`min-w-0 min-h-[44px] rounded-lg border p-3 text-sm font-semibold ${currency === cashCurrency ? 'border-sky-700 bg-sky-700 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'}`}>{currency === 'BOB' ? (es ? 'Bolivianos en efectivo' : 'Bolivianos in cash') : (es ? 'Billetes USD' : 'USD banknotes')}</button>)}
    </div>
    <ol aria-label={es ? 'Ruta hasta el efectivo' : 'Route to cash'} className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-200">
      {route.map((label, index) => <li key={label} className="flex min-w-0 items-center gap-2">{index > 0 && <span aria-hidden>→</span>}<span className="rounded-md bg-white dark:bg-gray-900 px-2 py-2">{label}</span></li>)}
    </ol>
    <ol className="mt-5 space-y-4">{steps.map(([title, text], index) => <li key={title} className="flex gap-3"><span className="font-bold text-sky-700 dark:text-sky-300">{index + 1}.</span><div className="min-w-0"><h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4><p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{text}</p></div></li>)}</ol>
    <button type="button" onClick={onShowSell} className="mt-4 min-h-[44px] py-2 text-left text-sm font-semibold text-sky-700 dark:text-sky-300 underline">{es ? 'Ver los pasos para vender USDT y recibir BOB' : 'See the steps to sell USDT and receive BOB'}</button>
    {wantsUsd && <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-800 p-4 text-sm text-gray-700 dark:text-gray-200" data-usd-cash-note><strong>{es ? 'El cambio a billetes USD es otra operación' : 'Exchanging for USD banknotes is a separate transaction'}</strong><p className="mt-2">{es ? 'Antes de depender de una casa de cambio, confirmá que tenga billetes USD y pedí la tasa y el total después de cargos. La cotización USDT/BOB de la app no es una cotización de efectivo. Un USDT no garantiza que recibas un billete de un dólar.' : 'Before relying on a currency exchange, confirm it has USD notes and ask for the rate and total after charges. The app’s USDT/BOB price is not a cash exchange quote. One USDT does not guarantee one dollar in banknotes.'}</p></div>}
    <details className="mt-4 border-t border-sky-200 dark:border-sky-900 pt-3">
      <summary className="cursor-pointer py-2 text-sm font-semibold text-gray-900 dark:text-white">{es ? '¿Puedo ir directamente a una casa de cambio con USDT?' : 'Can I take USDT straight to a currency exchange?'}</summary>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{es ? 'No lo des por hecho: algunas solo cambian billetes. Usá una opción directa únicamente si ese proveedor confirma que compra USDT y entrega efectivo. Verificá su identidad y ubicación, moneda y monto neto, comisiones, red aceptada, identificación requerida y cómo se entrega el dinero.' : 'Do not assume so: some only exchange banknotes. Consider a direct option only if that provider confirms it buys USDT and pays cash. Verify its identity and location, cash currency and net amount, fees, accepted network, required identification and handover process.'}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{es ? 'No envíes fondos por una promesa de efectivo ni compartas claves o códigos. Una operación externa queda fuera de la custodia y el proceso de disputa de una orden P2P de El Dorado. No traslades una orden de la app a un acuerdo externo.' : 'Do not send funds based only on a promise of cash or share passwords or codes. An external transaction is outside an El Dorado P2P order’s custody and dispute process. Do not move an app order into an outside deal.'}</p>
      <p className="mt-3 rounded-lg bg-white dark:bg-gray-900 p-3 text-sm text-gray-700 dark:text-gray-200">{es ? 'Pregunta útil: “Por este monto de USDT, ¿cuánto recibo en efectivo, en qué moneda y después de todos los cargos?”' : 'A useful question: “For this amount of USDT, how much cash do I receive, in which currency, after all charges?”'}</p>
    </details>
    <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{es ? 'Fuentes y comprobaciones' : 'Sources and checks'}: <a className="underline" target="_blank" rel="noopener noreferrer" href={DEPOSIT_HELP}>{es ? 'depósitos y redes' : 'deposits and networks'}</a> · <a className="underline" target="_blank" rel="noopener noreferrer" href={CURRENT_ADDRESS_HELP}>{es ? 'dirección vigente' : 'current address'}</a> · <a className="underline" target="_blank" rel="noopener noreferrer" href={BANK_TARIFF_EXAMPLE}>{es ? 'ejemplo de tarifario bancario (BCP)' : 'example bank tariff (BCP)'}</a>. {es ? 'Consultá las condiciones de tu propio banco; no recomendamos un banco o una casa de cambio específica.' : 'Check your own bank’s terms; no particular bank or currency exchange is recommended.'}</p>
  </section>;
}
