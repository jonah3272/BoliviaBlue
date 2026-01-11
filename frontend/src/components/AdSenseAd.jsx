import { useEffect, useRef } from 'react';

/**
 * AdSense Ad Component
 * 
 * Usage:
 * <AdSenseAd 
 *   adSlot="1234567890" 
 *   adFormat="auto" 
 *   fullWidthResponsive={true}
 * />
 * 
 * Or for specific sizes:
 * <AdSenseAd 
 *   adSlot="1234567890" 
 *   adFormat="rectangle" 
 *   style={{ display: 'block' }}
 * />
 */
function AdSenseAd({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = '',
  layout = '',
  layoutKey = '',
  classNameAd = ''
}) {
  const adRef = useRef(null);
  const adLoaded = useRef(false);

  useEffect(() => {
    // Only load ad if AdSense script is available
    if (!window.adsbygoogle || adLoaded.current) {
      return;
    }

    // Check if ad slot is provided
    if (!adSlot) {
      console.warn('[AdSense] No ad slot provided');
      return;
    }

    // Wait for the ad container to be in the DOM
    if (adRef.current) {
      try {
        // Push ad configuration to AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adLoaded.current = true;
        console.log('[AdSense] Ad unit loaded:', adSlot);
      } catch (error) {
        console.error('[AdSense] Error loading ad:', error);
      }
    }
  }, [adSlot]);

  // Don't render if no ad slot
  if (!adSlot) {
    return null;
  }

  return (
    <div 
      className={`adsense-container ${className}`}
      style={{
        minHeight: adFormat === 'auto' ? '100px' : '250px',
        display: 'block',
        ...style
      }}
    >
      <ins
        ref={adRef}
        className={`adsbygoogle ${classNameAd}`}
        style={{
          display: 'block',
          ...(fullWidthResponsive && { width: '100%' })
        }}
        data-ad-client="ca-pub-3497294777171749"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        {...(layout && { 'data-ad-layout': layout })}
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
    </div>
  );
}

export default AdSenseAd;
