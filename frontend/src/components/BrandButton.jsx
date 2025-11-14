import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK } from '../config/referrals';

// Reusable brand button component with animations
export function BinanceButton({ children, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <a
      href={BINANCE_REFERRAL_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold whitespace-nowrap relative overflow-hidden group ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #F3BA2F 0%, #FCD535 50%, #F3BA2F 100%)',
        backgroundSize: '200% 200%',
        animation: 'binance-pulse 3s ease-in-out infinite',
        color: '#000000'
      }}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{
             background: 'radial-gradient(circle, rgba(243, 186, 47, 0.4) 0%, transparent 70%)',
             animation: 'heartbeat 2s ease-in-out infinite'
           }}
      ></div>
      
      {/* Binance icon - Dollar sign */}
      <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
      
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
           }}
      ></div>
    </a>
  );
}

export function AirtmButton({ children, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <a
      href={AIRTM_REFERRAL_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold whitespace-nowrap relative overflow-hidden group ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 50%, #00D9FF 100%)',
        backgroundSize: '200% 200%',
        animation: 'airtm-pulse 3s ease-in-out infinite',
        color: '#FFFFFF'
      }}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{
             background: 'radial-gradient(circle, rgba(0, 217, 255, 0.4) 0%, transparent 70%)',
             animation: 'heartbeat 2s ease-in-out infinite'
           }}
      ></div>
      
      {/* Airtm icon - Money transfer/arrows */}
      <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
           }}
      ></div>
    </a>
  );
}

