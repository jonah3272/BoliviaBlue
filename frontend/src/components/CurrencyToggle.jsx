import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';

function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  const currencies = [
    { code: 'USD', label: 'USD', flag: '🇺🇸' },
    { code: 'BRL', label: 'BRL', flag: '🇧🇷' },
    { code: 'EUR', label: 'EUR', flag: '🇪🇺' }
  ];

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 sm:py-1.5 pr-8 sm:pr-7 text-sm sm:text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0 touch-manipulation"
        aria-label={language === 'es' ? 'Seleccionar moneda' : 'Select currency'}
        title={language === 'es' ? 'Cambiar moneda' : 'Change currency'}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.flag} {curr.label}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-2">
        <svg className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default CurrencyToggle;

