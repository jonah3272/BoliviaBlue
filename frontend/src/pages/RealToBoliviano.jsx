import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import Breadcrumbs from '../components/Breadcrumbs';
import { fetchBlueRate } from '../utils/api';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { getRealConversionPage, REAL_PATH } from '../data/realConversionPage';

const sectionClass = 'bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4';
const linkClass = 'text-green-700 dark:text-green-300 underline underline-offset-2';

export default function RealToBoliviano() {
  useAdsenseReady();
  const language = useLanguage()?.language || 'es';
  const [currentRate, setCurrentRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        // The complete record preserves its date even when the BRL cross is null.
        const rate = await fetchBlueRate();
        if (!active) return;
        setCurrentRate(rate);
        setLoadError(false);
      } catch {
        if (!active) return;
        setCurrentRate(previous => previous ? { ...previous, is_stale: true } : null);
        setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const page = getRealConversionPage(language, currentRate);
  const { model } = page;
  const es = language === 'es';
  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
    <PageMeta title={page.title} description={page.description} canonical={REAL_PATH} structuredData={page.schemas} />
    <Header /><Navigation />
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-gray-900 dark:text-white" data-real-conversion-page>
      <Breadcrumbs items={[{ label: es ? 'Inicio' : 'Home', path: es ? '/' : '/?lang=en' }, { label: es ? 'Real a boliviano' : 'Real to boliviano', path: REAL_PATH }]} />
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold">{page.heading}</h1>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{page.introduction}</p>
      </header>
      <section className="rounded-xl p-4 sm:p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-gray-800 space-y-4" aria-live="polite" aria-busy={isLoading} data-currency-rate-snapshot>
        <h2 className="text-xl font-semibold">{page.rateHeading}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[[page.buyLabel, model.buy], [page.sellLabel, model.sell]].map(([label, value]) => <div key={label} className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 space-y-2">
            <p className="text-sm">1 BRL =</p>
            <p className="text-2xl font-bold tabular-nums">{model.available ? `${value.toFixed(3)} BOB` : '—'}</p>
            <p className="text-sm">{label}</p>
          </div>)}
        </div>
        <p>{isLoading ? (es ? 'Consultando el registro…' : 'Checking the record…') : page.status}</p>
        {loadError && <p className="text-sm text-red-700 dark:text-red-300">{es ? 'No se pudo actualizar el registro. Se volverá a intentar.' : 'The record could not be refreshed. Another attempt will follow.'}</p>}
      </section>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300" data-real-timestamp>
        <p>{page.recordLabel}: {model.observedAt ? <time dateTime={model.observedAt}>{page.recordTime}</time> : page.recordTime}</p>
        <p>{page.timestampNote}</p>
      </div>
      <section className={sectionClass} aria-labelledby="real-amounts-heading">
        <h2 id="real-amounts-heading" className="text-xl font-semibold">{page.amountsHeading}</h2>
        <p className="text-sm">{page.amountsNote}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm tabular-nums" data-real-amounts>
            <thead><tr>{[page.amountColumn, page.buyColumn, page.sellColumn].map(label => <th className="p-2 border-b align-top" scope="col" key={label}>{label}</th>)}</tr></thead>
            <tbody>{page.amounts.map(row => <tr key={row.amount}><th className="p-2 font-medium" scope="row">{row.amount} BRL</th><td className="p-2">{row.buy}</td><td className="p-2">{row.sell}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      {page.sections.map(section => <section key={section.id} id={section.id} className={sectionClass}>
        <h2 className="text-xl font-semibold">{section.title}</h2>
        {section.paragraphs.map(text => <p className="leading-relaxed" key={text}>{text}</p>)}
      </section>)}
      <section className={sectionClass} aria-labelledby="real-faq-heading">
        <h2 id="real-faq-heading" className="text-xl font-semibold">{page.faqHeading}</h2>
        {page.faqs.map(faq => <div className="space-y-2" key={faq.question}><h3 className="font-semibold">{faq.question}</h3><p>{faq.answer}</p></div>)}
      </section>
      <nav className={sectionClass} aria-label={page.linksHeading}>
        <h2 className="text-xl font-semibold">{page.linksHeading}</h2>
        <ul className="space-y-3">{page.links.map(link => <li key={link.href}>{link.href.startsWith('/') ? <Link className={linkClass} to={link.href}>{link.label}</Link> : <a className={linkClass} href={link.href}>{link.label}</a>}</li>)}</ul>
      </nav>
      <BinanceBanner />
    </main>
    <Footer />
  </div>;
}
