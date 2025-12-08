import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockAdsOnThisPage } from '../utils/adsenseLoader';

/**
 * Redirect component for Spanish URL aliases
 * Performs a 301-equivalent client-side redirect
 * @param {string} to - Destination path
 */
function Redirect({ to }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Block ads on redirect pages (zero content, violates AdSense policy)
    blockAdsOnThisPage();
    
    // Replace current entry in history (acts like 301 redirect)
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
}

export default Redirect;

