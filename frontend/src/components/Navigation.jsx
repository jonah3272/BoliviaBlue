import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../config/navItems';
import NavIcon from './NavIcon';

function Navigation() {
  const location = useLocation();
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="hidden md:block sticky top-[57px] z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={`${item.path}-${item.key}`}
                to={item.path}
                className={`flex items-center gap-2 px-4 lg:px-6 py-3 text-sm font-medium whitespace-nowrap transition-smooth hover-lift-sm ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <NavIcon type={item.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                {item.path === '/' && item.shortKey ? (
                  <>
                    <span className="hidden lg:inline">{t(item.key)}</span>
                    <span className="lg:hidden">{t(item.shortKey)}</span>
                  </>
                ) : (
                  <span>{t(item.key)}</span>
                )}
              </Link>
            );
          })}

          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 text-sm font-medium whitespace-nowrap transition-smooth hover-lift-sm ${
                SECONDARY_NAV_ITEMS.some((item) => location.pathname === item.path)
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              <span>{languageContext?.language === 'es' ? 'Más' : 'More'}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={`${item.path}-${item.key}`}
                      to={item.path}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <NavIcon type={item.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{t(item.key)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
