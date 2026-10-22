import { cardReferenceLabel } from '../utils/cardReferenceLabel';
import { useState, useEffect } from 'react';
import { fetchCardRates } from '../utils/api';
import useCardFee from '../hooks/useCardFee';
import { paymentComparison } from '../utils/paymentComparison';
import { trackEvent } from '../utils/analytics';

export default function LocalCashComparison({ language = 'es' }) {
  const es = language !== 'en';
  const [cash, setCash] = useState(''); const [fees, setFees] = useState('0');
  const [amount, setAmount] = useState('100'); const [card, setCard] = useState(null);
  const [feeId, setFeeId] = useCardFee(); const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let active = true;
    const refresh = () => { setNow(Date.now()); fetchCardRates().then(data => { if (active) setCard(data); }).catch(() => { if (active) setCard(null); }); };
    refresh(); const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const usd = Number(amount), bob = Number(cash), charge = Number(fees);
  const valid = cash.trim() && fees.trim() && Number.isFinite(usd) && usd > 0 && Number.isFinite(bob) && bob > 0 && Number.isFinite(charge) && charge >= 0 && charge < bob;
  const cashRate = valid ? (bob - charge) / usd : null;
  const network = card?.visa_bob_per_usd ?? card?.mastercard_bob_per_usd ?? card?.amex_bob_per_usd;
  // Cash is the visitor's scenario, not a market observation. Only the card
  // freshness is inferred here; the visitor must confirm the cash offer's validity.
  const comparison = paymentComparison({ blue: cashRate, card: network, fee: Number(feeId) / 100, blueAt: new Date(now).toISOString(), cardAt: card?.t, now });
  const button = 'min-h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 w-full';
  return <section id="comparar-efectivo-local" className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-5 space-y-4">
    <h2 className="text-2xl font-bold">{es ? 'Tu oferta real de efectivo vs. tarjeta' : 'Your actual cash offer vs. card'}</h2>
    <p className="text-sm">{es ? 'Ingresá lo que te ofrecieron por tus billetes. No usamos la mediana P2P como precio local. El cálculo usa una tarjeta extranjera facturada en USD para el mismo gasto en Bs.' : 'Enter the offer for your banknotes. We do not substitute the P2P median for a local cash price. The calculation compares a foreign card billed in USD for the same BOB spending.'}</p>
    {card && <p className="text-xs">{cardReferenceLabel(card, language)}</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">{es ? 'USD en billetes que vendés' : 'USD banknotes you sell'}<select className={button} value={amount} onChange={e => setAmount(e.target.value)}><option value="100">USD 100</option><option value="1000">USD 1.000</option></select></label>
      <label className="text-sm font-semibold">{es ? 'Bs que te ofrecen, antes de cargos' : 'BOB offered before charges'}<input className={button} type="number" min="0" step="0.01" inputMode="decimal" value={cash} onChange={e => setCash(e.target.value)} placeholder={es ? 'Ingresá tu cotización' : 'Enter your quote'} /></label>
      <label className="text-sm font-semibold">{es ? 'Cargos adicionales del cambio (Bs)' : 'Additional exchange charges (BOB)'}<input className={button} type="number" min="0" step="0.01" inputMode="decimal" value={fees} onChange={e => setFees(e.target.value)} /></label>
      <label className="text-sm font-semibold">{es ? 'Comisión FX de tu tarjeta' : 'Your card FX fee'}<select className={button} value={feeId} onChange={e => setFeeId(e.target.value)}><option value="0">0%</option><option value="2.7">2.7%</option><option value="3">3%</option></select></label>
    </div>
    <p className="text-xs">{es ? 'Si la oferta ya es neta, dejá los cargos en 0. El 0% de tarjeta es un supuesto: confirmá tu comisión y la tasa de liquidación. El cálculo no verifica tu oferta de efectivo ni disponibilidad.' : 'If the offer is already net, leave charges at 0. A 0% card fee is an assumption: confirm your actual fee and settlement rate. This calculation does not verify the cash quote or availability.'}</p>
    <div className="rounded-xl bg-white dark:bg-gray-900 p-4 space-y-2" aria-live="polite" data-local-cash-result>
      {valid ? <><p className="font-semibold">{es ? 'Recibirías' : 'You would receive'} Bs {(bob-charge).toFixed(2)} · {cashRate.toFixed(4)} Bs/USD {es ? 'netos' : 'net'}</p>
        {comparison.status === 'cash' || comparison.status === 'card' ? <p>{comparison.status === 'cash' ? (es ? 'Con esta oferta, efectivo' : 'With this offer, cash') : (es ? 'Con estas tasas, tarjeta' : 'At these rates, card')} {es ? 'costaría' : 'would cost'} {comparison.savings.toFixed(1)}% {es ? 'menos para el mismo gasto en Bs.' : 'less for the same BOB spending.'}</p> : <p>{comparison.status === 'tie' ? (es ? 'Costo prácticamente igual.' : 'Costs are approximately equal.') : (es ? 'No hay una tasa de tarjeta vigente para comparar. Tu cálculo de efectivo sigue disponible.' : 'No current card rate is available for comparison. Your cash calculation is still available.')}</p>}
        {Number.isFinite(comparison.effective) && <p className="text-sm">{es ? 'Tarjeta estimada, después de comisión' : 'Estimated card rate after fee'}: {comparison.effective.toFixed(4)} Bs/USD{card?.t ? ` · ${es ? 'Lectura' : 'Observed'}: ${card.t}` : ''}</p>}
      </> : <p>{es ? 'Ingresá una oferta de efectivo válida para calcular lo que recibirías.' : 'Enter a valid cash offer to calculate what you would receive.'}</p>}
    </div>
    <button type="button" className="min-h-11 text-sm underline text-sky-700 dark:text-sky-300" onClick={() => { setCash(''); setFees('0'); trackEvent('local_cash_comparison_reset', { page_path: '/dolar-blue-santa-cruz' }); }}>{es ? 'Comparar otra oferta' : 'Compare another offer'}</button>
  </section>;
}
