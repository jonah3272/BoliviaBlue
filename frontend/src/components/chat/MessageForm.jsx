import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Major Bolivian cities
const BOLIVIAN_CITIES = [
  'Bolivia',
  'La Paz',
  'Santa Cruz de la Sierra',
  'Cochabamba',
  'El Alto',
  'Oruro',
  'Sucre',
  'Potosí',
  'Tarija',
  'Trinidad',
  'Montero',
  'Riberalta',
  'Yacuiba',
  'Quillacollo',
  'Sacaba',
  'Warnes',
  'Viacha',
  'Villa Tunari',
  'Tiquipaya',
  'Colcapirhua',
  'Vinto',
  'Camiri',
  'Cobija',
  'Villazón',
  'Tupiza',
  'Uyuni',
  'Rurrenabaque',
  'Copacabana',
  'Coroico',
  'Sorata'
];

export default function MessageForm({ onSubmit, loading, compact = false }) {
  const { language } = useLanguage() || { language: 'es' };
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [locationHint, setLocationHint] = useState('Bolivia'); // Default to Bolivia
  const [locationSearch, setLocationSearch] = useState('Bolivia'); // Default to Bolivia
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Filter cities based on search
  const filteredCities = BOLIVIAN_CITIES.filter(city =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Handle location selection
  const handleLocationSelect = (city) => {
    setLocationHint(city);
    setLocationSearch(city);
    setShowLocationDropdown(false);
  };

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationSearch(value);
    setShowLocationDropdown(true);
    
    // If exact match, set it
    if (BOLIVIAN_CITIES.includes(value)) {
      setLocationHint(value);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      // Use "Bolivia" if location is empty or not a valid city
      const finalLocation = locationHint && BOLIVIAN_CITIES.includes(locationHint) 
        ? locationHint 
        : 'Bolivia';
      await onSubmit(content, category, finalLocation);
      setContent('');
      setLocationHint('Bolivia');
      setLocationSearch('Bolivia');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const categories = [
    { value: 'general', label: language === 'es' ? 'General' : 'General' },
    { value: 'exchange-locations', label: language === 'es' ? 'Lugares' : 'Locations' },
    { value: 'street-rates', label: language === 'es' ? 'Tasas' : 'Rates' },
    { value: 'tips', label: language === 'es' ? 'Consejos' : 'Tips' },
    { value: 'binance-p2p', label: 'Binance P2P' }
  ];

  return (
    <form onSubmit={handleSubmit} className={`${compact ? 'space-y-2' : 'space-y-2 sm:space-y-3'}`}>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex-1 w-full">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'es' ? 'Escribe un mensaje...' : 'Write a message...'}
            className="w-full resize-none border-none focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base"
            rows={1}
            disabled={loading}
            maxLength={1000}
          />
          
          {!compact && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex-shrink-0"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              
              {/* Searchable Location Dropdown */}
              <div ref={locationRef} className="flex-1 relative min-w-0">
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={handleLocationInputChange}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder={language === 'es' ? 'Ubicación' : 'Location'}
                    className="w-full px-2 sm:px-3 py-1.5 pr-8 text-xs sm:text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 min-w-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {/* Dropdown arrow indicator */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {showLocationDropdown && (
                  <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleLocationSelect(city)}
                          className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            locationHint === city 
                              ? 'bg-blue-100 dark:bg-blue-900/40 font-medium text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {language === 'es' ? 'No se encontraron ciudades' : 'No cities found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base flex-shrink-0 self-end sm:self-auto"
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {content.length}/1000 {language === 'es' ? 'caracteres' : 'characters'}
      </p>
    </form>
  );
}
