import { useEffect } from 'react';

/**
 * AdSense Auto Ads Component
 * 
 * This enables Google's Auto Ads feature which automatically places ads
 * in optimal locations on your pages. This includes:
 * - In-article ads (between paragraphs)
 * - Anchor ads (sticky bottom ads)
 * - Vignette ads (full-screen interstitials)
 * - Sidebar ads
 * 
 * Usage:
 * Simply add <AdSenseAutoAds /> to your main layout (App.jsx or Home.jsx)
 * 
 * Configuration is done in AdSense dashboard:
 * 1. Go to Ads > Auto ads
 * 2. Enable the ad types you want
 * 3. Set ad density (recommended: Medium)
 */
function AdSenseAutoAds() {
  useEffect(() => {
    // Auto Ads are configured via the AdSense dashboard
    // The script tag in index.html with data-ad-client enables Auto Ads
    // This component just ensures the script is loaded
    
    if (window.adsbygoogle) {
      console.log('[AdSense Auto Ads] Script loaded, Auto Ads enabled');
    } else {
      console.log('[AdSense Auto Ads] Waiting for AdSense script to load...');
    }
  }, []);

  // This component doesn't render anything
  // Auto Ads are handled automatically by Google's script
  return null;
}

export default AdSenseAutoAds;
