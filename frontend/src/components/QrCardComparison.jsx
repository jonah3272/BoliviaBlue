import { cardReferenceLabel } from '../utils/cardReferenceLabel';
import { useEffect, useState } from 'react';
import { fetchCardRates } from '../utils/api';
import { compareQrAndCard } from '../utils/qrCardComparison';
import useCardFee from '../hooks/useCardFee';
import { trackEvent } from '../utils/analytics';

export default function QrCardComparison({ language = 'es' }) {
  const es = language !== 'en';
  const [bob, setBob] = useState('1000'); const [mode, setMode] = useState('total');
  const [qrTotal, setQrTotal] = useState(''); const [qrRate, setQrRate] = useState('');
  const [qrFee, setQrFee] = useState('0'); const [qrFixed, setQrFixed] = useState('0');
  const [cardMode, setCardMode] = useState('reference'); const [manualCard, setManualCard] = useState('');
  const [cardFixed, setCardFixed] = useState('0'); const [feeId, setFeeId] = useCardFee();
  const [manualFee, setManualFee] = useState(feeId); const [card, setCard] = useState(null); const [now, setNow] = useState(Date.now());
  const [attempted, setAttempted] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const refresh = () => { setNow(Date.now()); fetchCardRates().then(row => { if (active) setCard(row); }).catch(() => { if (active) setCard(null); }).finally(() => { if (active) setLoading(false); }); };
    refresh(); const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const reference = card?.visa_bob_per_usd ?? card?.mastercard_bob_per_usd ?? card?.amex_bob_per_usd;
  const age = now - Date.parse(card?.t); const fresh = Number.isFinite(age) && age >= -60000 && age <= 45 * 60000;
  const actualCard = cardMode === 'manual' ? manualCard : fresh ? reference : null;
  const result = compareQrAndCard({ bobAmount:bob, qrMode:mode, qrTotal, qrRate, qrFeePct:qrFee, qrFixedUsd:qrFixed, cardRate:actualCard, cardFeePct:manualFee, cardFixedUsd:cardFixed });
  const input = 'mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base font-normal';
  const field = (label, value, setValue, extra = {}) => <label className="block text-sm font-semibold">{label}<input className={input} type="number" inputMode="decimal" step="any" min="0" value={value} onChange={e=>{setValue(e.target.value);setAttempted(false);}} {...extra}/></label>;
  const money = v => new Intl.NumberFormat(es?'es-BO':'en-US',{style:'currency',currency:'USD'}).format(v);
  return <section id="comparador-qr-tarjeta" className="space-y-5" aria-label={es?'Comparador QR y tarjeta':'QR and card calculator'}>
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">{field(es?'Precio de la compra (Bs)':'Purchase price (BOB)',bob,value=>{setBob(value);setQrTotal('');},{id:'qr-bob-amount'})}<div className="mt-3 flex gap-2">{['100','1000','5000'].map(v=><button key={v} type="button" className="min-h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-4 text-sm" onClick={()=>{setBob(v);setQrTotal('');setAttempted(false);}}>Bs {v}</button>)}</div></div>
    <div className="grid gap-5 md:grid-cols-2">
      <fieldset className="min-w-0 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-5 space-y-4"><legend className="px-2 text-xl font-bold">{es?'Pago por QR':'QR payment'}</legend>
        <label className="block text-sm font-semibold">{es?'¿Qué muestra tu app?':'What does your app show?'}<select className={input} value={mode} onChange={e=>{setMode(e.target.value);setAttempted(false);}}><option value="total">{es?'Total final en USD':'Final USD total'}</option><option value="rate">{es?'Tasa en Bs por USD':'Rate in BOB per USD'}</option></select></label>
        {mode==='total'?<>{field(es?'USD totales que te cobra la app':'Total USD charged by the app',qrTotal,setQrTotal)}<p className="text-xs">{es?'Ingresá el total de la pantalla de confirmación, con todas las comisiones incluidas. Volvé a cotizar si cambiás el monto de la compra.':'Enter the confirmation-screen total including every fee. Request a new quote if you change the purchase amount.'}</p></>:<>{field(es?'Tasa QR (Bs por USD)':'QR rate (BOB per USD)',qrRate,setQrRate)}{field(es?'Comisión adicional QR (%)':'Additional QR fee (%)',qrFee,setQrFee,{max:'100'})}{field(es?'Cargo fijo QR (USD)':'QR fixed charge (USD)',qrFixed,setQrFixed)}<p className="text-xs">{es?'Ingresá solo cargos que no estén incluidos en la tasa. Si la app cotiza en USDT, convertí antes el costo total a USD incluyendo el costo de obtener USDT.':'Only add charges not already included in the rate. If the app quotes USDT, first express its full funding cost in USD.'}</p></>}
      </fieldset>
      <fieldset className="min-w-0 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 space-y-4"><legend className="px-2 text-xl font-bold">{es?'Tarjeta extranjera en USD':'Foreign card billed in USD'}</legend>
        <label className="block text-sm font-semibold">{es?'Tasa de tarjeta':'Card rate'}<select className={input} value={cardMode} onChange={e=>{setCardMode(e.target.value);setAttempted(false);}}><option value="reference">{es?'Usar referencia de tarjeta':'Use card reference'}</option><option value="manual">{es?'Ingresar mi tasa':'Enter my rate'}</option></select></label>
        {cardMode==='manual'?field(es?'Mi tasa de tarjeta (Bs por USD)':'My card rate (BOB per USD)',manualCard,setManualCard):<div className="text-sm" role="status">{loading?(es?'Cargando referencia…':'Loading reference…'):fresh&&Number.isFinite(reference)?<><p className="text-xl font-bold">{reference.toFixed(4)} Bs/USD</p><p className="mt-1 text-xs">{es?'Lectura':'Observed'}: {card.t}</p><p className="mt-2 text-xs">{cardReferenceLabel(card, language)}</p></>:<p>{es?'No hay una referencia vigente. Elegí “Ingresar mi tasa” para comparar.':'No current reference is available. Choose “Enter my rate” to compare.'}</p>}</div>}
        {field(es?'Comisión FX de tarjeta (%)':'Card FX fee (%)',manualFee,value=>{setManualFee(value);if(['0','2.7','3'].includes(value))setFeeId(value);},{max:'100'})}
        {field(es?'Cargo fijo de tarjeta (USD)':'Card fixed charge (USD)',cardFixed,setCardFixed)}
        <p className="text-xs">{es?'El 0% es un supuesto editable. Incluí cargos de financiación o recarga solo si aplican a esta compra. La tasa de liquidación puede diferir de la referencia.':'A 0% fee is an editable assumption. Include funding or top-up charges only if they apply to this purchase. Settlement may differ from the reference.'}</p>
      </fieldset>
    </div>
    <button type="button" className="min-h-12 w-full rounded-xl bg-sky-700 hover:bg-sky-800 text-white px-5 py-3 font-bold" onClick={()=>{setAttempted(true);if(result.valid)trackEvent('qr_card_comparison',{qr_input_mode:mode,card_rate_mode:cardMode,winner:result.winner});}}>{es?'Comparar costo total':'Compare total cost'}</button>
    {attempted&&(result.valid?<section className="rounded-2xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-gray-800 p-6 space-y-4" aria-live="polite" data-qr-card-result><h2 className="text-xl font-bold">{result.winner==='tie'?(es?'Mismo costo al centavo':'Same cost to the cent'):result.winner==='qr'?(es?'Con estos datos, QR sale más barato':'With these inputs, QR costs less'):(es?'Con estos datos, tarjeta sale más barata':'With these inputs, card costs less')}</h2><div className="grid grid-cols-2 gap-4"><p>QR<strong className="block text-2xl">{money(result.qrCost)}</strong><span className="text-xs">{result.qrEffective.toFixed(4)} Bs/USD {es?'netos':'net'}</span></p><p>{es?'Tarjeta':'Card'}<strong className="block text-2xl">{money(result.cardCost)}</strong><span className="text-xs">{result.cardEffective.toFixed(4)} Bs/USD {es?'netos':'net'}</span></p></div>{result.winner!=='tie'&&<p className="font-semibold">{es?'Diferencia':'Difference'}: {money(result.difference)} ({result.savingsPct.toFixed(1)}% {es?'del método más caro':'of the more expensive method'})</p>}<p className="text-xs">{es?'Comparación de la misma compra en Bs con los datos ingresados. Confirmá vigencia, costo final y disponibilidad antes de pagar.':'Comparison of the same BOB purchase using your inputs. Confirm quote validity, final charges and availability before paying.'}</p></section>:<p role="alert" className="rounded-xl bg-amber-50 text-amber-900 p-4">{result.error==='amount'?(es?'Ingresá un monto válido en Bs.':'Enter a valid BOB amount.'):result.error==='card'?(es?'Ingresá una tasa de tarjeta válida o esperá una referencia vigente. Revisá sus cargos.':'Enter a valid card rate or wait for a current reference. Check its fees.'):(es?'Ingresá el total QR o una tasa QR válida y revisá sus cargos.':'Enter the QR total or a valid QR rate and check its fees.')}</p>)}
  </section>;
}
