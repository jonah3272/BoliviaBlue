import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import QrCardComparison from '../components/QrCardComparison';
import { compareQrAndCard } from '../utils/qrCardComparison';
import { rateShareModel } from '../utils/rateShare';
const fetchCard = vi.hoisted(() => vi.fn());
vi.mock('../utils/api', () => ({ fetchCardRates: fetchCard }));
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => { fetchCard.mockReset(); fetchCard.mockResolvedValue({ visa_bob_per_usd: 10, t: new Date().toISOString(), source: 'wise-mid' }); });
const input = { bobAmount:'1000',qrMode:'total',qrTotal:'90',cardRate:10 };
it('compares the same BOB purchase and measures savings against the more expensive total',()=>{expect(compareQrAndCard(input)).toMatchObject({valid:true,qrCost:90,cardCost:100,winner:'qr',difference:10,savingsPct:10});});
it('does not add fees twice to a final app total',()=>{expect(compareQrAndCard({...input,qrFeePct:20,qrFixedUsd:10}).qrCost).toBe(90);});
it('includes percentage and fixed fees and can reverse the winner',()=>{expect(compareQrAndCard({...input,qrMode:'rate',qrRate:12,qrFeePct:20,qrFixedUsd:5,cardFeePct:3,cardFixedUsd:1})).toMatchObject({valid:true,qrCost:105,cardCost:104,winner:'card',difference:1});});
it('decides ties at payable cents',()=>{expect(compareQrAndCard({...input,qrTotal:100.004}).winner).toBe('tie');});
it('supports decimal comma rates',()=>{expect(compareQrAndCard({...input,qrMode:'rate',qrRate:'12,5'}).qrCost).toBe(80);});
it.each([0,-1,'',null,Infinity,'bad',1e100])('rejects invalid BOB amounts %s',bobAmount=>{expect(compareQrAndCard({...input,bobAmount}).valid).toBe(false);});
it.each([{qrTotal:0},{qrTotal:-5},{qrTotal:''},{qrMode:'unknown'},{cardRate:0},{cardFeePct:-1},{cardFixedUsd:-1},{qrMode:'rate',qrRate:12,qrFeePct:-1}])('rejects invalid rates or charges %j',overrides=>{expect(compareQrAndCard({...input,...overrides}).valid).toBe(false);});
for(const language of ['es','en']) {
 const es=language==='es';
 const enter=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
 const compare=()=>fireEvent.click(screen.getByRole('button',{name:es?'Comparar costo total':'Compare total cost'}));
 it(`compares fresh app/card quotes and clears the QR quote when the purchase changes (${language})`,async()=>{
  await act(async()=>render(<QrCardComparison language={language}/>));enter(es?'USD totales que te cobra la app':'Total USD charged by the app','90');compare();
  expect(document.querySelector('[data-qr-card-result]')).toHaveTextContent(es?'QR sale más barato':'QR costs less');
  enter(es?'Precio de la compra (Bs)':'Purchase price (BOB)','2000');
  expect(screen.getByLabelText(es?'USD totales que te cobra la app':'Total USD charged by the app')).toHaveValue(null);
  expect(document.querySelector('[data-qr-card-result]')).toBeNull();compare();expect(screen.getByRole('alert')).toBeVisible();
 });
 it(`withholds stale card references and permits manual comparison (${language})`,async()=>{
  fetchCard.mockResolvedValue({visa_bob_per_usd:10,t:new Date(Date.now()-3600000).toISOString()});await act(async()=>render(<QrCardComparison language={language}/>));
  enter(es?'USD totales que te cobra la app':'Total USD charged by the app','90');compare();expect(screen.getByRole('alert')).toBeVisible();
  enter(es?'Tasa de tarjeta':'Card rate','manual');enter(es?'Mi tasa de tarjeta (Bs por USD)':'My card rate (BOB per USD)','12');compare();expect(document.querySelector('[data-qr-card-result]')).toHaveTextContent(es?'tarjeta sale más barata':'card costs less');
 });
 it(`handles rate-mode fees and manual fallback during an API failure (${language})`,async()=>{
  fetchCard.mockRejectedValue(new Error('offline'));await act(async()=>render(<QrCardComparison language={language}/>));
  enter(es?'Tasa de tarjeta':'Card rate','manual');enter(es?'Mi tasa de tarjeta (Bs por USD)':'My card rate (BOB per USD)','10');
  enter(es?'¿Qué muestra tu app?':'What does your app show?','rate');enter(es?'Tasa QR (Bs por USD)':'QR rate (BOB per USD)','12');
  enter(es?'Comisión adicional QR (%)':'Additional QR fee (%)','20');enter(es?'Cargo fijo QR (USD)':'QR fixed charge (USD)','5');compare();
  expect(document.querySelector('[data-qr-card-result]')).toHaveTextContent(es?'tarjeta sale más barata':'card costs less');
  enter(es?'Comisión FX de tarjeta (%)':'Card FX fee (%)','10');expect(document.querySelector('[data-qr-card-result]')).toBeNull();compare();
  expect(document.querySelector('[data-qr-card-result]')).toHaveTextContent(es?'QR sale más barato':'QR costs less');
 });
}
it('shares observed times, labels stale data, and excludes undated or future numeric quotes',()=>{
 const now=Date.parse('2026-10-22T12:00:00Z'),rate={buy:12,sell:12.1,updatedAt:'2026-10-22T11:50:00Z'};
 const m=rateShareModel(rate,'es',now);expect(m.text).toContain('12.10');expect(m.text).toContain('UTC−4');
 expect(rateShareModel({...rate,updatedAt:null},'es',now).text).not.toContain('12.10');
 expect(rateShareModel({...rate,updatedAt:'2027-10-22T11:50:00Z'},'es',now).available).toBe(false);
 expect(rateShareModel({...rate,updatedAt:'2026-10-21T11:50:00Z'},'es',now).text).toContain('DESACTUALIZADA');
});

import LocalCashComparison from '../components/LocalCashComparison';
it('compares a user cash offer after exchange fees and refuses negative net proceeds',async()=>{
 await act(async()=>render(<LocalCashComparison language="en"/>));
 fireEvent.change(screen.getByLabelText('BOB offered before charges'),{target:{value:'1200'}});
 fireEvent.change(screen.getByLabelText('Additional exchange charges (BOB)'),{target:{value:'20'}});
 const result=document.querySelector('[data-local-cash-result]');expect(result).toHaveTextContent('1180.00');expect(result).toHaveTextContent('11.8000');expect(result).toHaveTextContent('cash');
 fireEvent.change(screen.getByLabelText('Additional exchange charges (BOB)'),{target:{value:'1300'}});expect(result).not.toHaveTextContent('1180.00');expect(result).toHaveTextContent('Enter a valid cash offer');
});

it('labels the automatic card reference as a Wise estimate',async()=>{
 await act(async()=>render(<QrCardComparison language="en"/>));
 expect(screen.getByText(/Estimated Wise reference/)).toBeVisible();
 expect(screen.getByText(/Estimated Wise reference/)).toHaveTextContent('not a confirmed Visa, Mastercard or issuer quote');
});
