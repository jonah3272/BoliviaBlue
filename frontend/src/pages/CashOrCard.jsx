import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import RateTrioStrip from '../components/RateTrioStrip';
import PaymentCostChecker from '../components/PaymentCostChecker';
import { useLanguage } from '../contexts/LanguageContext';
import { useRate } from '../contexts/RateContext';
import { cashCardPage, CASH_CARD_PATH } from '../data/cashCardPage';

export default function CashOrCard() {
  const { language } = useLanguage();
  const { rateData: rate } = useRate();
  const page = cashCardPage(language);
  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 text-gray-900 dark:text-white">
    <PageMeta title={page.title} description={page.description} canonical={CASH_CARD_PATH} structuredData={page.schema} />
    <Header /><Navigation />
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 pb-28">
      <header className="space-y-4">
        <a href={page.links[0].href} className="text-sm text-sky-700 dark:text-sky-300 underline">Bolivia Blue</a>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">{page.heading}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{page.introduction}</p>
        <p className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm sm:text-base">{page.answer}</p>
      </header>
      <RateTrioStrip buy={rate?.buy} sell={rate?.sell} updatedAt={rate?.updated_at_iso} officialBuy={rate?.official_buy} officialSell={rate?.official_sell} officialMid={rate?.official_mid} officialObservation={rate?.official_observation} language={language} showGuideLink={false} />
      <section className="space-y-5" aria-labelledby="cash-card-how"><h2 id="cash-card-how" className="text-2xl font-bold">{page.guideHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2">{page.sections.map(section => <section key={section.title} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"><h3 className="font-bold">{section.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.text}</p></section>)}</div>
      </section>
      <section className="rounded-2xl bg-sky-950 text-white p-6 space-y-3"><h2 className="text-xl font-bold">{page.exampleHeading}</h2><p className="leading-relaxed text-sky-100">{page.example}</p></section>
      <a href={`/comparar-qr-tarjeta${language === 'en' ? '?lang=en' : ''}`} className="block rounded-xl border border-sky-200 dark:border-sky-800 p-5 text-sky-700 dark:text-sky-300 font-semibold underline">{language === 'en' ? 'Paying by QR? Compare your app quote with card costs →' : '¿Pagás por QR? Compará la cotización de tu app con la tarjeta →'}</a>
      <PaymentCostChecker language={language} />
      <section className="space-y-4"><h2 className="text-2xl font-bold">{page.faqHeading}</h2>{page.questions.map(([question, answer]) => <details key={question} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{answer}</p></details>)}</section>
      <nav aria-label={page.resourcesHeading} className="border-t border-gray-200 dark:border-gray-700 pt-6"><h2 className="text-lg font-bold mb-3">{page.resourcesHeading}</h2><ul className="flex flex-wrap gap-x-5 gap-y-3">{page.links.map(link => <li key={link.href}><a href={link.href} className="text-sm text-sky-700 dark:text-sky-300 underline underline-offset-2">{link.label}</a></li>)}</ul></nav>
    </main><Footer />
  </div>;
}
