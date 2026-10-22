import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import BlueRateCards from '../components/BlueRateCards';
import LocalCashComparison from '../components/LocalCashComparison';
import { useLanguage } from '../contexts/LanguageContext';
import { SANTA_CRUZ_PATH, SANTA_CRUZ_PROVIDERS, santaCruzPage } from '../data/santaCruzExchange';
import { trackEvent } from '../utils/analytics';

export default function DolarBlueSantaCruz() {
  const { language = 'es' } = useLanguage(); const es = language !== 'en';
  const page = santaCruzPage(language); const [showOfficial, setShowOfficial] = useState(false);
  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 text-gray-900 dark:text-white">
    <PageMeta title={page.title} description={page.description} canonical={SANTA_CRUZ_PATH} structuredData={{ '@context':'https://schema.org', '@type':'WebPage', name:page.title, description:page.description, url:`https://www.boliviablue.com${SANTA_CRUZ_PATH}${es?'':'?lang=en'}`, inLanguage:es?'es-BO':'en', dateModified:'2026-10-22' }} />
    <Header /><Navigation />
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-28">
      <header className="space-y-4"><a href={es ? '/' : '/?lang=en'} className="text-sky-700 dark:text-sky-300 underline">Bolivia Blue</a><h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{page.heading}</h1><p className="text-lg text-gray-600 dark:text-gray-300">{page.intro}</p></header>
      <section><h2 className="text-xl font-bold mb-4">{es ? 'Referencia nacional P2P, no cotización de efectivo local' : 'National P2P reference, not a local cash quote'}</h2><BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} /></section>
      <LocalCashComparison language={language} />
      <section className="space-y-4"><h2 className="text-2xl font-bold">{page.providersHeading}</h2>
        {SANTA_CRUZ_PROVIDERS.map(provider => <article key={provider.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
          <h3 className="text-xl font-semibold">{provider.name}</h3><p>{provider.address}</p><p className="text-sm">{provider.phone} · {es ? 'Contacto revisado' : 'Contact checked'}: {provider.contactChecked}</p>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{page.status}</p><p className="text-sm text-gray-600 dark:text-gray-300">{page.limits}</p>
          <div className="flex flex-wrap gap-3"><a href={`https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(page.request)}`} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center rounded-lg bg-emerald-700 text-white px-4 py-2 font-semibold" onClick={() => trackEvent('cash_quote_contact', { provider_id:provider.id, channel:'whatsapp' })}>{es ? 'Pedir cotización por WhatsApp' : 'Request a WhatsApp quote'}</a><a href={provider.website} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center text-sky-700 dark:text-sky-300 underline">{es ? 'Fuente: sitio del proveedor' : 'Source: provider website'}</a></div>
        </article>)}
      </section>
      <section className="rounded-2xl bg-slate-900 text-white p-6 space-y-3"><h2 className="text-xl font-bold">{page.checklistHeading}</h2><ul className="list-disc pl-5 space-y-2 text-slate-200">{page.checklist.map(item => <li key={item}>{item}</li>)}</ul></section>
      <nav className="flex flex-wrap gap-4 text-sky-700 dark:text-sky-300 underline" aria-label={es ? 'Recursos relacionados' : 'Related resources'}><a href={`/efectivo-o-tarjeta-bolivia${es?'':'?lang=en'}`}>{es ? 'Comparación diaria: efectivo y tarjeta' : 'Daily cash and card comparison'}</a><a href={`/fuente-de-datos${es?'':'?lang=en'}`}>{es ? 'Metodología P2P' : 'P2P methodology'}</a><a href={`/calculadora${es?'':'?lang=en'}`}>{es ? 'Calculadora USD/BOB' : 'USD/BOB calculator'}</a></nav>
    </main><Footer />
  </div>;
}
