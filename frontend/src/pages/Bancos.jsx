import { useState, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'restriction'

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

  const getRestrictionIcon = (level) => {
    switch(level) {
      case 'none': return '✓';
      case 'moderate': return '⚠';
      case 'significant': return '⚠';
      case 'very_limited': return '✗';
      default: return '?';
    }
  };

  const getRestrictionOrder = (level) => {
    switch(level) {
      case 'none': return 1;
      case 'moderate': return 2;
      case 'significant': return 3;
      case 'very_limited': return 4;
      default: return 5;
    }
  };

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: banks.length,
      none: banks.filter(b => b.restrictions === 'none').length,
      moderate: banks.filter(b => b.restrictions === 'moderate').length,
      significant: banks.filter(b => b.restrictions === 'significant').length,
      very_limited: banks.filter(b => b.restrictions === 'very_limited').length
    };
  }, []);

  // Filter and sort banks
  const filteredAndSortedBanks = useMemo(() => {
    let result = banks.filter(bank => {
      const matchesFilter = selectedFilter === 'all' || bank.restrictions === selectedFilter;
      const matchesSearch = searchQuery === '' || 
        bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bank.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'restriction') {
      result.sort((a, b) => {
        const orderA = getRestrictionOrder(a.restrictions);
        const orderB = getRestrictionOrder(b.restrictions);
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [selectedFilter, searchQuery, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = banks.filter(bank => {
      const matchesFilter = selectedFilter === 'all' || bank.restrictions === selectedFilter;
      const matchesSearch = searchQuery === '' || 
        bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bank.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    
    return {
      total: filtered.length,
      noRestrictions: filtered.filter(b => b.restrictions === 'none').length,
      withRestrictions: filtered.filter(b => b.restrictions !== 'none').length
    };
  }, [selectedFilter, searchQuery]);

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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {language === 'es'
              ? 'Última actualización: 11 de enero de 2025'
              : 'Last updated: January 11, 2025'}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {language === 'es' ? 'Total de Bancos' : 'Total Banks'}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {language === 'es' ? 'Sin Restricciones' : 'No Restrictions'}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.noRestrictions}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {language === 'es' ? 'Con Restricciones' : 'With Restrictions'}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withRestrictions}</div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Buscar banco...' : 'Search bank...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                >
                  <option value="name">{language === 'es' ? 'Ordenar por nombre' : 'Sort by name'}</option>
                  <option value="restriction">{language === 'es' ? 'Ordenar por restricción' : 'Sort by restriction'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Buttons - Now with Counts */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Filtrar por nivel de restricción' : 'Filter by restriction level'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 ${
                  selectedFilter === 'all' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {language === 'es' ? 'Todos' : 'All'}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === 'all'
                    ? 'bg-gray-600 dark:bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {filterCounts.all}
                </span>
              </button>
              <button 
                onClick={() => setSelectedFilter('none')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 ${
                  selectedFilter === 'none' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-base">{getRestrictionIcon('none')}</span>
                {language === 'es' ? 'Sin restricciones' : 'No restrictions'}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === 'none'
                    ? 'bg-gray-600 dark:bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {filterCounts.none}
                </span>
              </button>
              <button 
                onClick={() => setSelectedFilter('moderate')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 ${
                  selectedFilter === 'moderate' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-base">{getRestrictionIcon('moderate')}</span>
                {language === 'es' ? 'Restricciones moderadas' : 'Moderate restrictions'}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === 'moderate'
                    ? 'bg-gray-600 dark:bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {filterCounts.moderate}
                </span>
              </button>
              <button 
                onClick={() => setSelectedFilter('significant')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 ${
                  selectedFilter === 'significant' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-base">{getRestrictionIcon('significant')}</span>
                {language === 'es' ? 'Restricciones significativas' : 'Significant restrictions'}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === 'significant'
                    ? 'bg-gray-600 dark:bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {filterCounts.significant}
                </span>
              </button>
              <button 
                onClick={() => setSelectedFilter('very_limited')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 ${
                  selectedFilter === 'very_limited' 
                    ? 'bg-gray-700 dark:bg-gray-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-base">{getRestrictionIcon('very_limited')}</span>
                {language === 'es' ? 'Muy limitado' : 'Very limited'}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedFilter === 'very_limited'
                    ? 'bg-gray-600 dark:bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {filterCounts.very_limited}
                </span>
              </button>
            </div>
          </div>

          {/* Banks Grid - Now Filtered and Sorted */}
          {filteredAndSortedBanks.length === 0 ? (
            <div className="text-center py-12 mb-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'No se encontraron bancos' : 'No banks found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {language === 'es' 
                  ? 'Intenta ajustar tus filtros o búsqueda para ver más resultados.'
                  : 'Try adjusting your filters or search to see more results.'}
              </p>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredAndSortedBanks.map((bank, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-2 flex-1">
                      {bank.name}
                    </h2>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 flex-shrink-0 ${getRestrictionColor(bank.restrictions)}`}>
                      <span className="text-sm">{getRestrictionIcon(bank.restrictions)}</span>
                      {getRestrictionLabel(bank.restrictions)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          {language === 'es' ? 'Límite mensual' : 'Monthly limit'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {bank.limit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'es' ? 'USD por mes' : 'USD per month'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          {language === 'es' ? 'Restricciones' : 'Restrictions'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {bank.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {/* Related Links - Improved Design */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {language === 'es' ? 'Enlaces Relacionados' : 'Related Links'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/buy-dollars"
                className="group p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Cómo Comprar Dólares' : 'How to Buy Dollars'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Guía completa para comprar dólares en Bolivia' : 'Complete guide to buying dollars in Bolivia'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <Link
                to="/calculator"
                className="group p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Calculadora de Divisas' : 'Currency Calculator'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Convierte USD a BOB y viceversa' : 'Convert USD to BOB and vice versa'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <Link
                to="/bolivia-blue-rate"
                className="group p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Información sobre el dólar blue' : 'Information about blue dollar'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <Link
                to="/faq"
                className="group p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Respuestas a preguntas comunes' : 'Answers to common questions'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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

