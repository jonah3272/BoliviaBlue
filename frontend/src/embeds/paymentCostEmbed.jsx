import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PaymentCostChecker from '../components/PaymentCostChecker';
import './paymentCostEmbed.css';

// Only presentation options are read. Prices, rates and fees never enter a URL,
// storage, analytics, a parent-frame message or a network request.
export function PaymentCostEmbed({ initialLanguage = 'es' }) {
  const [language, setLanguage] = useState(initialLanguage === 'en' ? 'en' : 'es');
  const es = language === 'es';
  const guide = es ? '/guia-dinero-bolivia' : '/bolivia-money-guide';
  useEffect(() => {
    document.documentElement.lang = es ? 'es-BO' : 'en';
    document.title = es ? 'Comparar pagos BOB/USD — Bolivia Blue' : 'Compare BOB/USD payments — Bolivia Blue';
  }, [es]);
  return <main className="mx-auto max-w-3xl p-3 text-gray-900 dark:text-white" data-payment-cost-embed>
    <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <a className="inline-flex min-h-[44px] items-center text-sky-700 dark:text-sky-300 underline" href={`https://www.boliviablue.com${guide}#payment-cost-comparison`} target="_blank" rel="noopener noreferrer">
        {es ? 'Bolivia Blue · Guía de dinero' : 'Bolivia Blue · Money guide'}
      </a>
      <nav aria-label={es ? 'Idioma del comparador' : 'Checker language'} className="flex gap-2">
        {[['es', 'Español'], ['en', 'English']].map(([value, label]) => <button key={value} type="button" lang={value} aria-pressed={language === value} onClick={() => setLanguage(value)} className="min-h-[44px] rounded-lg border border-gray-400 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600">{label}</button>)}
      </nav>
    </header>
    <PaymentCostChecker language={language} />
    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
      {es ? 'Confirmá con el comercio los dos precios para la misma compra y con tu proveedor la tasa que realmente podés usar.' : 'Confirm both prices for the same purchase with the merchant and the rate you can actually use with your provider.'}
    </p>
  </main>;
}

const target = document.getElementById('w');
if (target && new URLSearchParams(window.location.search).get('mode') === 'payment-cost') {
  const params = new URLSearchParams(window.location.search);
  document.documentElement.classList.toggle('dark', params.get('theme') === 'dark');
  createRoot(target).render(<PaymentCostEmbed initialLanguage={params.get('lang')} />);
}
