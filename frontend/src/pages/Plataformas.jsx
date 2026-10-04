import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { trackNavigation } from '../utils/analytics';
import { trackReferralClicked } from '../utils/analyticsEvents';
import { getPlatformComparisonPage, REVIEWED_AT, SOURCES, BINANCE_HELP, ELDORADO_HELP } from '../data/platformComparison.js';
import RateBinanceCta from '../components/RateBinanceCta';

function Plataformas() {
  useAdsenseReady();
  const page = getPlatformComparisonPage(useLanguage()?.language || 'es');
  const { language, es, copy, platforms, title, description, local, buyGuide, cashGuide, breadcrumbs, comparisonSchema, compareSteps, safety } = page;
  const linkClass = 'inline-block py-2 font-semibold text-sky-700 dark:text-sky-300 underline underline-offset-2';

  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
    <PageMeta title={title} description={description} canonical="/plataformas" structuredData={comparisonSchema} />
    <Header /><Navigation />
    <main className="google-anno-skip max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="max-w-4xl space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{copy.heading}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">{copy.introduction}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{copy.referenceWarning}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{copy.referralDisclosure}</p>
        <nav aria-label={copy.nextStep} className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link className={linkClass} to={buyGuide} onClick={() => trackNavigation('/comprar-dolares', copy.buyNavigationLabel, 'internal')}>{copy.buyGuideLabel}</Link>
          <a className={linkClass} href="#comparacion">{copy.viewComparison}</a>
          <Link className={linkClass} to={cashGuide}>{copy.cashGuideLabel}</Link>
        </nav>
      </section>
      <RateBinanceCta placement="plataformas_top" />
      <section id="comparacion" className="scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] space-y-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.comparisonHeading}</h2>
        <p className="text-gray-600 dark:text-gray-300">{copy.comparisonIntroduction}</p>
        <div className="grid min-w-0 gap-5 lg:grid-cols-2">{platforms.map((platform) => <article key={platform.id} data-platform={platform.partner} className="min-w-0 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{platform.name}</h3>
          <dl className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {[[copy.purpose, platform.purpose], [copy.payment, platform.payment], [copy.checks, platform.checks]].map(([label, value]) => <div key={label}><dt className="font-semibold text-gray-900 dark:text-white">{label}</dt><dd className="mt-1">{value}</dd></div>)}
          </dl>
          {platform.firstStep && <p className="mt-4 rounded-lg bg-sky-50 dark:bg-sky-950/30 p-3 text-sm text-gray-700 dark:text-gray-300"><strong>{copy.firstStep}</strong>{platform.firstStep}</p>}
          <div className="mt-5 space-y-3">
            {platform.partner === 'binance' && <a href={SOURCES.binance[0][2]} target="_blank" rel="noopener noreferrer" className={linkClass}>{copy.binanceGuide}</a>}
            {platform.referral ? <>
              <a href={platform.referral} target="_blank" rel="noopener noreferrer sponsored" onClick={() => trackReferralClicked({ language, partner: platform.partner, placement: 'plataformas', destination: platform.referral, link_label: `plataformas_${platform.id}` })} className="block min-h-[48px] rounded-xl bg-sky-700 hover:bg-sky-800 px-4 py-3 text-center font-bold text-white">{platform.cta}</a>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{platform.disclosure}</p>
            </> : <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{copy.informationalLink}</p>}
            {platform.partner === 'eldorado' && <Link to={buyGuide} className={linkClass}>{copy.firstPurchase}</Link>}
          </div>
          <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-3 text-xs">
            <p className="font-semibold text-gray-600 dark:text-gray-300">{copy.officialDocumentation}</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">{SOURCES[platform.partner].map(([spanish, english, href]) => <li key={href} className="min-w-0"><a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>{es ? spanish : english}</a></li>)}</ul>
          </div>
        </article>)}</div>
      </section>
      <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-7">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.stepsHeading}</h2>
        <ol className="mt-5 list-decimal pl-5 space-y-4 text-gray-700 dark:text-gray-300">{compareSteps.map((step) => <li key={step} className="pl-1">{step}</li>)}</ol>
      </section>
      <section data-payment-safety className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-5 sm:p-7">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.safetyHeading}</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{safety.map(([label, text]) => <div key={label}><dt className="font-bold text-gray-900 dark:text-white">{label}</dt><dd className="mt-1">{text}</dd></div>)}</dl>
        <p className="mt-5 text-sm text-gray-700 dark:text-gray-300">{copy.safetyWarning}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 text-sm"><a className={linkClass} href={BINANCE_HELP} target="_blank" rel="noopener noreferrer">{copy.binanceAppeal}</a><a className={linkClass} href={ELDORADO_HELP} target="_blank" rel="noopener noreferrer">{copy.eldoradoDispute}</a></div>
      </section>
      <section className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-5 sm:p-7">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{copy.nextHeading}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4"><Link to={buyGuide} className="inline-block rounded-xl bg-sky-700 hover:bg-sky-800 px-5 py-3 font-bold text-white" onClick={() => trackNavigation('/comprar-dolares', copy.guideNavigationLabel, 'internal')}>{copy.buyGuideCta}</Link><Link className={linkClass} to={local('/calculadora')} onClick={() => trackNavigation('/calculadora', copy.calculatorNavigationLabel, 'internal')}>{copy.calculatorLabel}</Link></div>
      </section>
      <section className="text-sm text-gray-600 dark:text-gray-400">
        <h2 className="font-semibold text-gray-900 dark:text-white">{copy.sourcesHeading}</h2>
        <p className="mt-2">{copy.reviewedLabel}<time dateTime={REVIEWED_AT}>{copy.reviewedDate}</time>. {copy.sourcesNote}</p>
        <Link to={local('/bancos')} className={linkClass}>{copy.banksLabel}</Link>
      </section>
    </main>
    <Footer />
  </div>;
}

export default Plataformas;
