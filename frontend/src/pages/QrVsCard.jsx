import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import QrCardComparison from '../components/QrCardComparison';
import { useLanguage } from '../contexts/LanguageContext';
import { qrCardPage, QR_CARD_PATH } from '../data/qrCardPage';
export default function QrVsCard(){
  const { language='es' }=useLanguage(); const es=language!=='en'; const p=qrCardPage(language);
  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 text-gray-900 dark:text-white"><PageMeta title={p.title} description={p.description} canonical={QR_CARD_PATH} structuredData={{'@context':'https://schema.org','@type':'WebPage',name:p.title,description:p.description,url:`https://www.boliviablue.com${QR_CARD_PATH}${es?'':'?lang=en'}`,inLanguage:es?'es-BO':'en',dateModified:'2026-10-22'}}/><Header/><Navigation/><main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 pb-28"><header className="space-y-4"><a className="text-sky-700 dark:text-sky-300 underline" href={es?'/':'/?lang=en'}>Bolivia Blue</a><h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{p.heading}</h1><p className="text-lg text-gray-600 dark:text-gray-300">{p.intro}</p></header><QrCardComparison language={language}/><section className="rounded-2xl bg-slate-900 text-white p-6 space-y-4"><h2 className="text-xl font-bold">{es?'Cómo comparar QR y tarjeta':'How to compare QR and card'}</h2><ol className="list-decimal pl-5 space-y-3 text-slate-200">{p.steps.map(s=><li key={s}>{s}</li>)}</ol></section><p className="text-sm text-gray-600 dark:text-gray-300">{p.note}</p><nav className="flex flex-wrap gap-4 text-sky-700 dark:text-sky-300 underline"><a href={`/efectivo-o-tarjeta-bolivia${es?'':'?lang=en'}`}>{es?'Efectivo vs. tarjeta':'Cash vs. card'}</a><a href={`/dolar-blue-santa-cruz${es?'':'?lang=en'}`}>{es?'Cotizar efectivo en Santa Cruz':'Santa Cruz cash quotes'}</a></nav></main><Footer/></div>;
}
