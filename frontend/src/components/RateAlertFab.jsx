import { useLanguage } from '../contexts/LanguageContext';

/** Mobile FAB — scrolls to #price-alerts on Home / rate hubs */
export default function RateAlertFab() {
  const { language } = useLanguage();
  const es = language === 'es';

  const scrollToAlerts = () => {
    const el = document.getElementById('price-alerts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.href = '/#price-alerts';
  };

  return (
    <button
      type="button"
      onClick={scrollToAlerts}
      className="md:hidden fixed z-[35] right-4 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 touch-manipulation hover:bg-sky-400 active:scale-95 transition-transform"
      aria-label={es ? 'Crear alerta de precio' : 'Set price alert'}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    </button>
  );
}
