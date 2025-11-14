import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

function Bancos() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Bank restrictions data - updated with more natural, specific content
  const banks = [
    {
      name: 'Banco de Crédito de Bolivia',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Puedes usar los $100 completos sin problemas. Funciona bien para compras online, suscripciones y pagos internacionales.'
        : 'You can use the full $100 without issues. Works well for online purchases, subscriptions, and international payments.'
    },
    {
      name: 'Banco Ganadero',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Límite completo disponible. No hay restricciones conocidas para compras internacionales o pagos online.'
        : 'Full limit available. No known restrictions for international purchases or online payments.'
    },
    {
      name: 'Banco Fortaleza',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Acceso completo al límite mensual. Sin restricciones reportadas por usuarios para diferentes tipos de transacciones.'
        : 'Full access to monthly limit. No restrictions reported by users for different types of transactions.'
    },
    {
      name: 'Banco Bisa',
      restrictions: 'moderate',
      limit: '$100',
      details: language === 'es' 
        ? 'Bloquea pagos a Facebook Ads y algunas plataformas de publicidad. El resto de compras internacionales funcionan normalmente.'
        : 'Blocks payments to Facebook Ads and some advertising platforms. Other international purchases work normally.'
    },
    {
      name: 'Banco Sol',
      restrictions: 'moderate',
      limit: '$100',
      details: language === 'es' 
        ? 'No permite pagar anuncios en Facebook. Funciona para compras normales, streaming, y otras plataformas digitales.'
        : 'Does not allow Facebook ad payments. Works for normal purchases, streaming, and other digital platforms.'
    },
    {
      name: 'Banco Nacional de Bolivia',
      restrictions: 'significant',
      limit: '$100',
      details: language === 'es' 
        ? 'Solo permite compras en servicios de streaming como Netflix, Spotify, y similares. No funciona para compras generales online.'
        : 'Only allows purchases on streaming services like Netflix, Spotify, and similar. Does not work for general online purchases.'
    },
    {
      name: 'Banco Económico',
      restrictions: 'significant',
      limit: '$100',
      details: language === 'es' 
        ? 'Limitado principalmente a servicios de streaming. Las compras en tiendas online o pagos generales pueden ser rechazados.'
        : 'Limited mainly to streaming services. Online store purchases or general payments may be rejected.'
    },
    {
      name: 'Banco Mercantil Santa Cruz',
      restrictions: 'very_limited',
      limit: '$100',
      details: language === 'es' 
        ? 'Para cuentas nuevas desde septiembre 2024: máximo USD 15 por semana en Brasil, sin compras internacionales online. Cuentas antiguas pueden tener menos restricciones.'
        : 'For new accounts since September 2024: maximum USD 15 per week in Brazil, no international online purchases. Older accounts may have fewer restrictions.'
    },
    {
      name: 'Banco Unión',
      restrictions: 'very_limited',
      limit: '$100',
      details: language === 'es' 
        ? 'Clientes nuevos desde junio 2024: máximo USD 20 en tiendas físicas y solo USD 10 para compras online. Los clientes antiguos generalmente tienen acceso completo.'
        : 'New customers since June 2024: maximum USD 20 at physical stores and only USD 10 for online purchases. Older customers generally have full access.'
    }
  ];

  const getRestrictionColor = (level) => {
    switch(level) {
      case 'none': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'significant': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'very_limited': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getRestrictionLabel = (level) => {
    if (language === 'es') {
      switch(level) {
        case 'none': return 'Sin restricciones';
        case 'moderate': return 'Restricciones moderadas';
        case 'significant': return 'Restricciones significativas';
        case 'very_limited': return 'Muy limitado';
        default: return 'Desconocido';
      }
    } else {
      switch(level) {
        case 'none': return 'No restrictions';
        case 'moderate': return 'Moderate restrictions';
        case 'significant': return 'Significant restrictions';
        case 'very_limited': return 'Very limited';
        default: return 'Unknown';
      }
    }
  };

  const bancosSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": language === 'es' 
      ? "Límites y Restricciones de Bancos Bolivianos para Compras Internacionales"
      : "Limits and Restrictions of Bolivian Banks for International Purchases",
    "description": language === 'es'
      ? "Guía completa sobre los límites mensuales y restricciones de los principales bancos bolivianos para compras internacionales con tarjeta de crédito o débito."
      : "Complete guide on monthly limits and restrictions of major Bolivian banks for international purchases with credit or debit cards.",
    "author": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz"
    },
    "datePublished": "2025-01-11",
    "dateModified": "2025-01-11"
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es'
          ? 'Límites y Restricciones de Bancos Bolivianos | Bolivia Blue con Paz'
          : 'Bolivian Bank Limits and Restrictions | Bolivia Blue with Paz'}
        description={language === 'es'
          ? 'Guía completa sobre límites mensuales y restricciones de bancos bolivianos para compras internacionales. Compara restricciones del Banco Unión, Bisa, Nacional, y más.'
          : 'Complete guide on monthly limits and restrictions of Bolivian banks for international purchases. Compare restrictions from Banco Unión, Bisa, Nacional, and more.'}
        keywords={language === 'es'
          ? "límites bancos bolivia, restricciones bancos bolivia, banco unión límites, banco bisa restricciones, compras internacionales bolivia, límite mensual dólares bolivia, banco nacional bolivia, banco económico bolivia, restricciones tarjeta bolivia"
          : "bolivian bank limits, bank restrictions bolivia, banco union limits, banco bisa restrictions, international purchases bolivia, monthly dollar limit bolivia, banco nacional bolivia, banco economico bolivia, card restrictions bolivia"}
        canonical="/bancos"
        structuredData={bancosSchema}
      />
      
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Bancos' : 'Banks', url: '/bancos' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? 'Límites y Restricciones de Bancos Bolivianos'
              : 'Limits and Restrictions of Bolivian Banks'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {language === 'es'
              ? 'La mayoría de bancos en Bolivia tienen un límite base de $100 USD mensuales para compras internacionales. Sin embargo, cada banco aplica sus propias restricciones sobre dónde y cómo puedes usar ese límite.'
              : 'Most banks in Bolivia have a base limit of $100 USD per month for international purchases. However, each bank applies its own restrictions on where and how you can use that limit.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es'
              ? 'Última actualización: 11 de enero de 2025'
              : 'Last updated: January 11, 2025'}
          </p>

          {/* Filter Buttons - Now Functional */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Filtrar por nivel de restricción' : 'Filter by restriction level'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                  selectedFilter === 'all' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {language === 'es' ? 'Todos' : 'All'}
              </button>
              <button 
                onClick={() => setSelectedFilter('none')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                  selectedFilter === 'none' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-900/50'
                }`}
              >
                {language === 'es' ? 'Sin restricciones' : 'No restrictions'}
              </button>
              <button 
                onClick={() => setSelectedFilter('moderate')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                  selectedFilter === 'moderate' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-300 dark:hover:bg-yellow-900/50'
                }`}
              >
                {language === 'es' ? 'Restricciones moderadas' : 'Moderate restrictions'}
              </button>
              <button 
                onClick={() => setSelectedFilter('significant')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                  selectedFilter === 'significant' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-orange-200 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-900/50'
                }`}
              >
                {language === 'es' ? 'Restricciones significativas' : 'Significant restrictions'}
              </button>
              <button 
                onClick={() => setSelectedFilter('very_limited')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 ${
                  selectedFilter === 'very_limited' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-300 dark:hover:bg-red-900/50'
                }`}
              >
                {language === 'es' ? 'Muy limitado' : 'Very limited'}
              </button>
            </div>
          </div>

          {/* Banks Grid - Now Filtered */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {banks
              .filter(bank => selectedFilter === 'all' || bank.restrictions === selectedFilter)
              .map((bank, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-2">
                    {bank.name}
                  </h2>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${getRestrictionColor(bank.restrictions)}`}>
                    {getRestrictionLabel(bank.restrictions)}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {language === 'es' ? 'Límite mensual base' : 'Base monthly limit'}
                    </span>
                    <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {bank.limit}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      {language === 'es' ? 'Restricciones' : 'Restrictions'}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {bank.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? '⚠️ Información Importante' : '⚠️ Important Information'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'es'
                ? 'Esta información es referencial y puede cambiar sin previo aviso. Los límites y restricciones pueden variar según el tipo de cuenta, antigüedad del cliente, y políticas del banco. Siempre consulta directamente con tu banco para información actualizada sobre límites y restricciones específicas de tu cuenta.'
                : 'This information is for reference only and may change without notice. Limits and restrictions may vary by account type, customer tenure, and bank policies. Always consult directly with your bank for updated information on specific limits and restrictions for your account.'}
            </p>
          </div>

          {/* Related Links */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Enlaces Relacionados' : 'Related Links'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/buy-dollars"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {language === 'es' ? 'Cómo Comprar Dólares' : 'How to Buy Dollars'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Guía completa para comprar dólares en Bolivia' : 'Complete guide to buying dollars in Bolivia'}
                </div>
              </Link>
              <Link
                to="/calculator"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {language === 'es' ? 'Calculadora de Divisas' : 'Currency Calculator'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Convierte USD a BOB y viceversa' : 'Convert USD to BOB and vice versa'}
                </div>
              </Link>
              <Link
                to="/bolivia-blue-rate"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Información sobre el dólar blue' : 'Information about blue dollar'}
                </div>
              </Link>
              <Link
                to="/faq"
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {language === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es' ? 'Respuestas a preguntas comunes' : 'Answers to common questions'}
                </div>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default Bancos;

