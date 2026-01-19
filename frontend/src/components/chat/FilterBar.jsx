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
      <div className="flex flex-wrap items-center gap-3 p-4">
        {/* Sort Options - Reddit-style */}
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterChange('sort', option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                filters.sort === option.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Time Period Filter - Reddit-style */}
        <select
          value={filters.time_period}
          onChange={(e) => handleFilterChange('time_period', e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timePeriods.map(period => (
            <option key={period.value} value={period.value}>{period.label}</option>
          ))}
        </select>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange('category', cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                filters.category === cat.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Location Filter */}
        {locations.length > 0 && (
          <select
            value={filters.location_hint}
            onChange={(e) => handleFilterChange('location_hint', e.target.value)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{language === 'es' ? 'Todas las ubicaciones' : 'All locations'}</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        )}
        
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar mensajes...' : 'Search messages...'}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
        
        {/* Clear Filters */}
        {(filters.category !== 'all' || filters.location_hint !== 'all' || filters.search || filters.sort !== 'newest' || filters.time_period !== 'all') && (
          <button
            onClick={clearFilters}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
