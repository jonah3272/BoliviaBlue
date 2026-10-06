import { Link } from 'react-router-dom';
import { localizedLocation } from '../utils/pageLocale';
import { trackRelatedLinkClicked } from '../utils/analyticsEvents';

/** A seller's next step beside the existing mobile calculator shortcut. */
export default function MobileMoneyActions({ language = 'es' }) {
  const es = language === 'es';
  const sellGuide = localizedLocation({
    pathname: '/comprar-dolares',
    search: '?intent=buy_usdt&operation=sell',
    hash: '#guia',
  }, language);
  const linkClass = 'inline-flex min-h-[44px] min-w-0 max-w-full items-center justify-center rounded px-1 text-xs font-medium text-sky-700 dark:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

  return (
    <nav aria-label={es ? 'Guía de venta y calculadora' : 'Selling guide and calculator'} className="google-anno-skip flex w-full max-w-xs flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <Link
        to={sellGuide}
        onClick={() => trackRelatedLinkClicked({
          language,
          destination: sellGuide,
          link_label: 'home_mobile_sell_usdt_guide',
          page_type: 'home',
        })}
        className={linkClass}
      >
        {es ? 'USDT → BOB: ver pasos' : 'USDT → BOB: see steps'}
      </Link>
      <Link to="/calculadora" className={linkClass}>
        {es ? 'Calculadora' : 'Calculator'}
      </Link>
    </nav>
  );
}
