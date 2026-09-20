import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const TABS = [
  { path: '/dolar-blue-hoy', key: 'navDolarHoy', shortEs: 'Hoy', shortEn: 'Today' },
  { path: '/', key: 'navDashboardShort', shortEs: 'Inicio', shortEn: 'Home' },
  { path: '/calculadora', key: 'navCalculator', shortEs: 'Calc', shortEn: 'Calc' },
  { path: '/comprar-dolares', key: 'navBuyDollars', shortEs: 'Comprar', shortEn: 'Buy' },
];

function TabIcon({ type, active }) {
  const stroke = active ? 'currentColor' : 'currentColor';
  const icons = {
    hoy: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    ),
    home: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    calc: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
    buy: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  };
  return (
    <svg className="w-6 h-6" fill="none" stroke={stroke} viewBox="0 0 24 24" aria-hidden>
      {icons[type] || icons.home}
    </svg>
  );
}

const ICON_BY_PATH = {
  '/dolar-blue-hoy': 'hoy',
  '/': 'home',
  '/calculadora': 'calc',
  '/comprar-dolares': 'buy',
};

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200/90 dark:border-gray-700/90 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label={es ? 'Navegación principal' : 'Main navigation'}
    >
      <div className="grid grid-cols-4 h-14">
        {TABS.map((tab) => {
          const active = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
          const label = es ? tab.shortEs : tab.shortEn;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold touch-manipulation min-h-[44px] ${
                active
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <TabIcon type={ICON_BY_PATH[tab.path]} active={active} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
