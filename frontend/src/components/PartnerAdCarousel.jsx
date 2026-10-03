import FinancialOfferCard from './FinancialOfferCard';

// Compatibility export: offers stay fixed while the visitor reads or taps.
export default function PartnerAdCarousel({ placement = 'partner_offer', midRate = null }) {
  return <FinancialOfferCard placement={placement} midRate={midRate} />;
}
