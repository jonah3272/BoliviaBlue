import { useEffect } from 'react';
import { reservedBottomSpace } from '../utils/headerRate';

/** Move our fixed controls above space reserved by the ad provider, without editing ads or body padding. */
export default function useAdReservedSpace() {
  useEffect(() => {
    const update = () => {
      const reserved = reservedBottomSpace(window.getComputedStyle(document.body).paddingBottom);
      document.documentElement.style.setProperty('--bb-ad-reserved-bottom', `${reserved}px`);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.documentElement.style.removeProperty('--bb-ad-reserved-bottom');
    };
  }, []);
}
