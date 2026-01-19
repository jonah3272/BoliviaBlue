import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function FilterBar({ onFilterChange, stats }) {
  const { language } = useLanguage() || { language: 'es' };
  const [filters, setFilters] = useState({
    category: 'all',
    location_hint: 'all',
    sort: 'newest',
    time_period: 'all',
    search: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      category: 'all',
      location_hint: 'all',
      sort: 'newest',
      time_period: 'all',
      search: ''
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const categories = [
    { value: 'all', label: language === 'es' ? 'Todos' : 'All' },
    { value: 'exchange-locations', label: language === 'es' ? 'Lugares' : 'Locations' },
    { value: 'street-rates', label: language === 'es' ? 'Tasas' : 'Rates' },
    { value: 'tips', label: language === 'es' ? 'Consejos' : 'Tips' },
    { value: 'binance-p2p', label: 'Binance P2P' },
    { value: 'general', label: language === 'es' ? 'General' : 'General' }
  ];

  const locations = stats?.locations ? Object.keys(stats.locations) : [];

  // Reddit-style sort options
  const sortOptions = [
    { value: 'newest', label: language === 'es' ? 'Más recientes' : 'Newest' },
    { value: 'oldest', label: language === 'es' ? 'Más antiguos' : 'Oldest' },
    { value: 'top', label: language === 'es' ? 'Top (todos)' : 'Top (all time)' },
    { value: 'top_today', label: language === 'es' ? 'Top hoy' : 'Top today' },
    { value: 'top_week', label: language === 'es' ? 'Top esta semana' : 'Top this week' },
    { value: 'top_month', label: language === 'es' ? 'Top este mes' : 'Top this month' }
  ];

  // Time period options (Reddit-style)
  const timePeriods = [
    { value: 'all', label: language === 'es' ? 'Todo el tiempo' : 'All time' },
    { value: 'hour', label: language === 'es' ? 'Última hora' : 'Past hour' },
    { value: 'today', label: language === 'es' ? 'Hoy' : 'Today' },
    { value: 'week', label: language === 'es' ? 'Esta semana' : 'This week' },
    { value: 'month', label: language === 'es' ? 'Este mes' : 'This month' },
    { value: 'year', label: language === 'es' ? 'Este año' : 'This year' }
  ];

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Main Filter Row - Compact */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          {/* Sort Dropdown */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Time Period Dropdown */}
          <select
            value={filters.time_period}
            onChange={(e) => handleFilterChange('time_period', e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timePeriods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>

          {/* Category Filter - Only show first 3 as buttons, rest in dropdown */}
          <div className="flex gap-1.5">
            {categories.slice(0, 3).map(cat => (
              <button
                key={cat.value}
                onClick={() => handleFilterChange('category', cat.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  filters.category === cat.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {categories.length > 3 && (
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {categories.slice(3).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Secondary Row - Search and Location */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar mensajes...' : 'Search messages...'}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            </div>
          </div>
          
          {/* Location Filter */}
          {locations.length > 0 && (
            <select
              value={filters.location_hint}
              onChange={(e) => handleFilterChange('location_hint', e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'es' ? 'Todas' : 'All'}</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          )}
          
          {/* Clear Filters */}
          {(filters.category !== 'all' || filters.location_hint !== 'all' || filters.search || filters.sort !== 'newest' || filters.time_period !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              title={language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
            >
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
