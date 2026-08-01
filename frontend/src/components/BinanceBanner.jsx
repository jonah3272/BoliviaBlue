import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PartnerAdCarousel from './PartnerAdCarousel';
import { fetchBlueRate } from '../utils/api';

/**
 * Sitewide monetization slot: rotating partner funnel
 * (El Dorado → Takenos → Airtm → Binance).
 */
function BinanceBanner({ placement: placementProp, midRate: midRateProp = null }) {
  const location = useLocation();
  const placement =
    placementProp ||
    `seo${location.pathname.replace(/\//g, '_').replace(/_+/g, '_') || '_home'}`;
  const [midRate, setMidRate] = useState(midRateProp);

  useEffect(() => {
    if (midRateProp != null) {
      setMidRate(midRateProp);
      return;
    }
    let cancelled = false;
    fetchBlueRate()
      .then((data) => {
        if (cancelled) return;
        const buy = data?.buy ?? data?.buy_bob_per_usd;
        const sell = data?.sell ?? data?.sell_bob_per_usd;
        if (Number.isFinite(buy) && Number.isFinite(sell)) {
          setMidRate((buy + sell) / 2);
        } else if (Number.isFinite(buy)) {
          setMidRate(buy);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [midRateProp]);

  return <PartnerAdCarousel placement={placement} midRate={midRate} />;
}

export default BinanceBanner;
