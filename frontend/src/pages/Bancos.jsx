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

  // Bank restrictions data based on dolarbluebolivia.click
  const banks = [
    {
      name: 'Banco de Crédito de Bolivia',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Sin restricciones aparentes'
        : 'No apparent restrictions'
    },
    {
      name: 'Banco Ganadero',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Sin restricciones aparentes'
        : 'No apparent restrictions'
    },
    {
      name: 'Banco Fortaleza',
      restrictions: 'none',
      limit: '$100',
      details: language === 'es' 
        ? 'Sin restricciones aparentes'
        : 'No apparent restrictions'
    },
    {
      name: 'Banco Bisa',
      restrictions: 'moderate',
      limit: '$100',
      details: language === 'es' 
        ? 'No permite pagar anuncios de Facebook'
        : 'Does not allow Facebook ad payments'
    },
    {
      name: 'Banco Sol',
      restrictions: 'moderate',
      limit: '$100',
      details: language === 'es' 
        ? 'No permite pagar anuncios de Facebook'
        : 'Does not allow Facebook ad payments'
    },
    {
      name: 'Banco Nacional de Bolivia',
      restrictions: 'significant',
      limit: '$100',
      details: language === 'es' 
        ? 'Solo para servicios de streaming'
        : 'Only for streaming services'
    },
    {
      name: 'Banco Económico',
      restrictions: 'significant',
      limit: '$100',
      details: language === 'es' 
        ? 'Solo para servicios de streaming'
        : 'Only for streaming services'
    },
    {
      name: 'Banco Mercantil Santa Cruz',
      restrictions: 'very_limited',
      limit: '$100',
      details: language === 'es' 
        ? 'No se permite gastar todo el límite. USD 15 por semana en Brasil y sin compras internacionales para cuentas nuevas desde el 11/09/2024'
        : 'Cannot spend entire limit. USD 15 per week in Brazil and no international purchases for new accounts since 09/11/2024'
    },
    {
      name: 'Banco Unión',
      restrictions: 'very_limited',
      limit: '$100',
      details: language === 'es' 
        ? 'Clientes nuevos desde 01/06/2024: hasta USD 20 en comercios presenciales y USD 10 en compras web'
        : 'New customers since 06/01/2024: up to USD 20 at physical stores and USD 10 for online purchases'
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
              ? 'Todos los bancos permiten un límite mensual base de $100, pero las restricciones pueden variar según la institución.'
              : 'All banks allow a base monthly limit of $100, but restrictions may vary by institution.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es'
              ? 'Última actualización: 11 de enero de 2025'
              : 'Last updated: January 11, 2025'}
          </p>

          {/* Filter Buttons - Improved Design */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Filtrar por nivel de restricción' : 'Filter by restriction level'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {language === 'es' ? 'Sin restricciones' : 'No restrictions'}
              </button>
              <button className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {language === 'es' ? 'Restricciones moderadas' : 'Moderate restrictions'}
              </button>
              <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {language === 'es' ? 'Restricciones significativas' : 'Significant restrictions'}
              </button>
              <button className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {language === 'es' ? 'Muy limitado' : 'Very limited'}
              </button>
            </div>
          </div>

          {/* Banks Grid - Improved Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {banks.map((bank, index) => (
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

