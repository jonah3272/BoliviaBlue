import { useLanguage } from '../contexts/LanguageContext';

/**
 * Shows cross-source P2P methodology (Binance + El Dorado + OKX + Bybit when available).
 */
export default function CrossSourceBadge({ sourcesUsed = [], className = '' }) {
  const { language } = useLanguage();
  const es = language === 'es';
  const n = sourcesUsed?.length || 0;
  const label =
    n >= 2
      ? es
        ? `Lectura verificada · mediana ${n} plataformas P2P`
        : `Verified reading · median of ${n} P2P platforms`
      : es
        ? 'Lectura verificada · Binance P2P'
        : 'Verified reading · Binance P2P';

  const names =
    n >= 2
      ? sourcesUsed
          .map((id) => {
            const map = {
              binance: 'Binance',
              eldorado: 'El Dorado',
              okx: 'OKX',
              bybit: 'Bybit',
            };
            return map[id] || id;
          })
          .join(' · ')
      : 'Binance P2P';

  return (
    <div className={`text-center ${className}`}>
      <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">{label}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{names}</p>
    </div>
  );
}
