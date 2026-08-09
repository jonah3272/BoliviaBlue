import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import { useLanguage } from '../contexts/LanguageContext';
import { getBreadcrumbList, getWebPage } from '../utils/seoSchema';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

/**
 * Advertise hub — classic sitelink target (Publicitar / Advertise).
 */
function Publicitar() {
  useAdsenseReady();
  const { language } = useLanguage();
  const es = language === 'es';

  const crumbs = getBreadcrumbList([
    { name: es ? 'Inicio' : 'Home', url: '/' },
    { name: es ? 'Publicitar' : 'Advertise', url: '/publicitar' },
  ]);

  const webPage = getWebPage({
    name: es ? 'Publicitar en Bolivia Blue' : 'Advertise on Bolivia Blue',
    description: es
      ? 'Anuncia tu casa de cambio, fintech o producto en Bolivia Blue: widget, homepage y menciones para audiencia que busca el dólar paralelo.'
      : 'Advertise your exchange house, fintech or product on Bolivia Blue: widget, homepage and mentions for people searching the parallel dollar.',
    url: '/publicitar',
    inLanguage: es ? 'es-BO' : 'en-US',
  });

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={
          es
            ? 'Publicitar en Bolivia Blue | Anuncios para casas de cambio y fintech'
            : 'Advertise on Bolivia Blue | Ads for exchange houses & fintech'
        }
        description={
          es
            ? 'Impulsa tu marca ante quienes buscan el dólar blue en Bolivia. Espacios en homepage, widget embed y menciones. Escribí a info@boliviablue.com.'
            : 'Reach people searching Bolivia’s blue dollar. Homepage placements, embed widget and mentions. Email info@boliviablue.com.'
        }
        keywords={
          es
            ? 'publicitar bolivia blue, anunciar casa de cambio bolivia, publicidad dólar paralelo, sponsor bolivia blue'
            : 'advertise bolivia blue, bolivia exchange ads, parallel dollar advertising'
        }
        canonical="/publicitar"
        structuredData={[webPage, crumbs]}
      />
      <Header />
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <Breadcrumbs
          items={[
            { name: es ? 'Inicio' : 'Home', url: '/' },
            { name: es ? 'Publicitar' : 'Advertise', url: '/publicitar' },
          ]}
        />

        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {es ? 'Publicitar en Bolivia Blue' : 'Advertise on Bolivia Blue'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {es
              ? 'Llegá a gente que ya está buscando el dólar paralelo, Binance P2P y cuánto está el dólar hoy en Bolivia.'
              : 'Reach people already searching the parallel dollar, Binance P2P, and today’s rate in Bolivia.'}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {es ? 'Qué ofrecemos' : 'What we offer'}
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              {es
                ? 'Espacios en homepage y landings de alto tráfico (dólar blue hoy, ciudades, euro/real).'
                : 'Placements on homepage and high-traffic landings (blue dollar today, cities, euro/real).'}
            </li>
            <li>
              {es ? (
                <>
                  Widget embebible —{' '}
                  <Link to="/widget" className="text-blue-600 dark:text-blue-400 hover:underline">
                    boliviablue.com/widget
                  </Link>
                </>
              ) : (
                <>
                  Embeddable widget —{' '}
                  <Link to="/widget" className="text-blue-600 dark:text-blue-400 hover:underline">
                    boliviablue.com/widget
                  </Link>
                </>
              )}
            </li>
            <li>
              {es
                ? 'Menciones para casas de cambio, fintechs, apps de remesas y creadores.'
                : 'Mentions for exchange houses, fintechs, remittance apps and creators.'}
            </li>
            <li>
              {es ? (
                <>
                  Kit de prensa y citas —{' '}
                  <Link to="/prensa" className="text-blue-600 dark:text-blue-400 hover:underline">
                    /prensa
                  </Link>
                </>
              ) : (
                <>
                  Press kit & citations —{' '}
                  <Link to="/prensa" className="text-blue-600 dark:text-blue-400 hover:underline">
                    /prensa
                  </Link>
                </>
              )}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {es ? 'Contacto comercial' : 'Business contact'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {es
              ? 'Contanos quién sos, qué querés promover y en qué plazas (La Paz, Santa Cruz, Cochabamba, nacional).'
              : 'Tell us who you are, what you want to promote, and which markets (La Paz, Santa Cruz, Cochabamba, nationwide).'}
          </p>
          <a
            href="mailto:info@boliviablue.com?subject=Publicitar%20en%20Bolivia%20Blue"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors"
          >
            info@boliviablue.com
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Publicitar;
