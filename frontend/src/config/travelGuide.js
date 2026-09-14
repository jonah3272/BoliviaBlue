/** Traveler money guide — Spanish + English URLs for tourist SERPs. */
export const TRAVEL_GUIDE_ES = '/guia-dinero-bolivia';
export const TRAVEL_GUIDE_EN = '/bolivia-money-guide';

export function travelGuidePath(language = 'es') {
  return language === 'en' ? TRAVEL_GUIDE_EN : TRAVEL_GUIDE_ES;
}
