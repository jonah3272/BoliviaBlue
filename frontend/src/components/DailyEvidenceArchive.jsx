import { useEffect, useState } from 'react';
import { DAILY_EVIDENCE_SEEDS, cleanArchive, archiveCopy, latestCompletedDate, normalizeArchiveBefore, REPORT_FEED_URL, REPORT_FEED_TITLE, reportFeedCopy } from '../data/dailyEvidenceArchive';
export default function DailyEvidenceArchive({ language = 'es', before: requestedBefore = new URLSearchParams(window.location.search).get('before') }) {
  const initialBefore = normalizeArchiveBefore(requestedBefore);
  const initialSeeds = DAILY_EVIDENCE_SEEDS.filter(r=>!initialBefore||r.date<initialBefore);
  const [reports,setReports]=useState(()=>cleanArchive(initialSeeds));
  const [unavailable,setUnavailable]=useState(false),[loading,setLoading]=useState(true),[before,setBefore]=useState(null);
  const c=archiveCopy(language),feed=reportFeedCopy(language),query=language==='en'?'?lang=en':'';
  useEffect(() => {
    // Adopt the static press-shell feed link without touching language alternates.
    const link = document.head.querySelector('link[data-bb-report-feed]') || document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('type', 'application/rss+xml');
    link.setAttribute('title', REPORT_FEED_TITLE);
    link.setAttribute('href', REPORT_FEED_URL);
    link.setAttribute('data-bb-report-feed', 'true');
    if (!link.parentNode) document.head.appendChild(link);
    return () => link.remove();
  }, []);
  useEffect(()=>{const controller=new AbortController();setLoading(true);
    fetch('/api/daily-report?view=archive'+(initialBefore?'&before='+encodeURIComponent(initialBefore):''),{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Archive unavailable');return r.json();}).then(data=>{if(!Array.isArray(data.reports))throw new Error('Invalid archive');setReports(cleanArchive([...initialSeeds,...data.reports]));setUnavailable(Boolean(data.unavailable));setBefore(data.next_before||null);}).catch(error=>{if(error.name!=='AbortError')setUnavailable(true);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();},[]);
  const loadOlder=async()=>{if(loading||!before)return;setLoading(true);try{const response=await fetch(`/api/daily-report?view=archive&before=${encodeURIComponent(before)}`);if(!response.ok)throw new Error('Archive unavailable');const data=await response.json();if(!Array.isArray(data.reports)||data.unavailable)throw new Error('Archive unavailable');setReports(current=>cleanArchive([...current,...data.reports]));setBefore(data.next_before||null);setUnavailable(false);}catch{setUnavailable(true);}finally{setLoading(false);}};
  return <section id="informes-diarios" className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-5 sm:p-7 space-y-4" aria-labelledby="daily-evidence-title">
    <p className="text-xs uppercase tracking-widest font-bold text-teal-700 dark:text-teal-300">Bolivia Blue / P2P USDT–BOB</p>
    <h2 id="daily-evidence-title" className="text-2xl font-bold text-gray-900 dark:text-white">{c.title}</h2>
    <p className="text-gray-700 dark:text-gray-300">{c.intro}</p><p className="text-sm text-gray-600 dark:text-gray-400">{c.method} {c.timezone}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400"><a href={REPORT_FEED_URL} type="application/rss+xml" className="text-blue-600 dark:text-blue-400 underline">{feed.label}</a> · {feed.limit}</p>
    {unavailable&&<p role="status" className="rounded-lg bg-amber-50 text-amber-900 p-3 text-sm">{c.unavailable}</p>}
    {!initialBefore&&reports[0]?.date<latestCompletedDate()&&<p className="rounded-lg bg-amber-50 text-amber-900 p-3 text-sm">{c.behind}</p>}
    {reports[0]&&<a className="block rounded-xl bg-slate-900 text-white p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700" href={reports[0].path+query}><span className="text-xs uppercase tracking-wider text-teal-200">{c.latest}</span><span className="block text-2xl font-bold mt-1">{reports[0].date}</span><span className="text-sm text-slate-200">{c.revision} {reports[0].revision} · {c.open} →</span></a>}
    <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">{reports.slice(1).map(row=><li key={row.path}><a href={row.path+query} className="block rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 p-4 text-slate-900 dark:text-white hover:border-sky-500"><span className="font-semibold">{row.date}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{c.revision} {row.revision} · {c.open} →</span></a></li>)}</ul>
    {before&&<button type="button" disabled={loading} onClick={loadOlder} className="rounded-lg border border-sky-600 px-4 py-2 text-sky-800 dark:text-sky-300 disabled:opacity-50">{loading?c.loading:c.older}</button>}
    {loading&&<p role="status" className="text-sm text-gray-500">{c.loading}</p>}<p className="text-xs text-gray-600 dark:text-gray-400">{c.limit}</p>
  </section>;
}
