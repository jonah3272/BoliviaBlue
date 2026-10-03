import { useEffect, useRef } from 'react';
import { trackOfferViewed } from '../utils/analyticsEvents';

// Once per visible creative/intent/language/placement during this mounted visit.
// No cookie, persistent identifier, timer or inferred signup/commission.
export function useOfferImpression({ offer, language, placement, enabled = true }) {
  const ref = useRef(null);
  const seen = useRef(new Set());
  const { id: offer_id, partner, intent, variant } = offer;
  useEffect(() => {
    const node = ref.current;
    const key = JSON.stringify([offer_id, intent, language, placement, variant]);
    if (!enabled || !node || seen.current.has(key) || typeof IntersectionObserver === 'undefined') return undefined;
    let active = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!active || !entry.isIntersecting || entry.intersectionRatio < 0.35 || seen.current.has(key)) return;
      seen.current.add(key);
      trackOfferViewed({ offer_id, partner, intent, language, placement, variant });
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => { active = false; observer.disconnect(); };
  }, [offer_id, partner, intent, language, placement, variant, enabled]);
  return ref;
}
