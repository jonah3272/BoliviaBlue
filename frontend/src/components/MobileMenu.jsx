import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import CurrencyToggle from './CurrencyToggle';
import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK } from '../config/referrals';
import { MOBILE_NAV_ITEMS } from '../config/navItems';
import NavIcon from './NavIcon';
import { trackReferralClicked } from '../utils/analyticsEvents';

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const overlay =
    mounted &&
    createPortal(
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Menu — portaled so header backdrop-filter does not clip fixed UI */}
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={language === 'es' ? 'Menú de navegación' : 'Navigation menu'}
          className={`fixed top-0 right-0 h-[100dvh] w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl z-[70] md:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 pt-[max(1rem,env(safe-area-inset-top))]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'es' ? 'Menú' : 'Menu'}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={language === 'es' ? 'Cerrar menú' : 'Close menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain py-4">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={`${item.path}-${item.key}`}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <NavIcon type={item.icon} />
                  <span className="font-medium">
                    {item.path === '/' && item.shortKey ? t(item.shortKey) : t(item.key)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Moneda' : 'Currency'}
              </span>
              <CurrencyToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Idioma' : 'Language'}
              </span>
              <LanguageToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'es' ? 'Tema' : 'Theme'}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <a
              href={BINANCE_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackReferralClicked({
                  language,
                  partner: 'binance',
                  placement: 'mobile_menu',
                  destination: BINANCE_REFERRAL_LINK,
                  link_label: 'mobile_menu_binance',
                })
              }
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-yellow-500/70 dark:border-yellow-400/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
              <span>Binance</span>
            </a>
            <a
              href={AIRTM_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackReferralClicked({
                  language,
                  partner: 'airtm',
                  placement: 'mobile_menu',
                  destination: AIRTM_REFERRAL_LINK,
                  link_label: 'mobile_menu_airtm',
                })
              }
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-cyan-500/70 dark:border-cyan-400/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Airtm</span>
            </a>
          </div>
        </div>
      </>,
      document.body
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative z-[80]"
        aria-label={language === 'es' ? (isOpen ? 'Cerrar menú' : 'Abrir menú') : isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {overlay}
    </>
  );
}

export default MobileMenu;
