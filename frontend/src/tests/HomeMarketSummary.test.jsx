import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import HomeMarketSummary from '../components/HomeMarketSummary';
const report={date:'2026-10-21',revision:1,path:'/prensa/informes/2026-10-21/v1',sha256:'a'.repeat(64),generated_at:'2026-10-22T09:00:00Z',median:11.83005,comparison:null};
afterEach(()=>{cleanup();document.getElementById('home-market-summary-data')?.remove();vi.unstubAllGlobals();vi.useRealTimers();});
function bootstrap() { const script=document.createElement('script');script.id='home-market-summary-data';script.type='application/json';script.textContent=JSON.stringify(report);document.head.appendChild(script); }
it('immediately keeps the dated SSR report when optional fetch fails',async()=>{
 vi.setSystemTime(new Date('2026-10-22T16:00:00Z'));bootstrap();vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
 render(<HomeMarketSummary language="en"/>);
 expect(screen.getByText(/11.83005 BOB\/USDT/)).toBeTruthy();
 expect(screen.getByRole('link').getAttribute('href')).toBe(report.path+'?lang=en');
 await waitFor(()=>expect(fetch).toHaveBeenCalled());
});
it('shows valid fetched evidence in Spanish and updates language without changing numbers',async()=>{
 vi.setSystemTime(new Date('2026-10-22T16:00:00Z'));vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({report})}));
 const {rerender}=render(<HomeMarketSummary/>);
 await screen.findByText(/Resumen del día completo/);expect(screen.getByText(/11.83005 BOB\/USDT/)).toBeTruthy();
 rerender(<HomeMarketSummary language="en"/>);expect(screen.getByText(/Completed-day summary/)).toBeTruthy();
 expect(screen.getByRole('link').getAttribute('href')).toBe(report.path+'?lang=en');
});
it('fails closed when no evidence is published',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({report:null})}));
 const {container}=render(<HomeMarketSummary/>);await waitFor(()=>expect(fetch).toHaveBeenCalled());expect(container.textContent).toBe('');
});
it('ignores a response after unmount and aborts its request',async()=>{
 let signal;vi.stubGlobal('fetch',vi.fn((_url,options)=>{signal=options.signal;return new Promise(()=>{});}));
 const {unmount}=render(<HomeMarketSummary/>);await waitFor(()=>expect(fetch).toHaveBeenCalled());unmount();expect(signal.aborted).toBe(true);
});
