import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blockAdsOnThisPage } from '../utils/adsenseLoader';

/**
 * Redirect component for Spanish URL aliases
 * Performs a 301-equivalent client-side redirect
 * @param {string} to - Destination path
 */
function Redirect({ to }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get base URL
  const baseUrl = typeof window !== 'undefined' 
    ? (window.location.hostname.includes('stage') ? 'https://stage.boliviablue.com' : 'https://boliviablue.com')
    : 'https://boliviablue.com';
  
  // Canonical URL should point to destination
  const canonicalUrl = `${baseUrl}${to}`;
  // Current URL (the one being redirected)
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

  useEffect(() => {
    // Block ads on redirect pages (zero content, violates AdSense policy)
    blockAdsOnThisPage();
    
    // Small delay to ensure canonical tag is set before redirect
    // This helps Google understand the redirect relationship
    const timer = setTimeout(() => {
      // Replace current entry in history (acts like 301 redirect)
      navigate(to, { replace: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, to]);

  // Return minimal content with canonical tag pointing to destination
  // This helps Google understand the redirect relationship
  return (
    <>
      <Helmet>
        {/* Canonical tag points to destination - tells Google this is a redirect */}
        <link rel="canonical" href={canonicalUrl} />
        {/* Noindex to prevent indexing of redirect pages */}
        <meta name="robots" content="noindex, nofollow" />
        {/* Redirect signal for search engines */}
        <meta httpEquiv="refresh" content={`0; url=${canonicalUrl}`} />
      </Helmet>
      {/* Minimal content to satisfy crawlers */}
      <div style={{ display: 'none' }}>
        <p>Redirecting to <a href={canonicalUrl}>{canonicalUrl}</a></p>
      </div>
    </>
  );
}

export default Redirect;

