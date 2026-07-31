import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BuyFunnelCTA from './BuyFunnelCTA';
import { fetchBlueRate } from '../utils/api';

/**
 * Drop-in replacement for the old Binance-only banner.
 * Loads mid parallel rate when not passed, then renders BuyFunnelCTA.
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

  return (
    <BuyFunnelCTA placement={placement} midRate={midRate} showGuideLink />
  );
}

export default BinanceBanner;
