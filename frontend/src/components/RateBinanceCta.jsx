import FinancialOfferCard from './FinancialOfferCard';

// Legacy import name retained for existing rate/SEO surfaces. The visible offer is intent-based.
export default function RateBinanceCta({ placement = 'rate_offer', midRate = null }) {
  return <div className="google-anno-skip"><FinancialOfferCard placement={placement} midRate={midRate} /></div>;
}
