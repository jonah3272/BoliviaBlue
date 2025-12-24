import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockAdsOnThisPage } from '../utils/adsenseLoader';

/**
 * This page redirects to /bolivian-blue (canonical page)
 * No content should be rendered to avoid duplicate content issues
 */
function BlueRateBolivia() {
  const navigate = useNavigate();
  
  // Block ads on redirect pages
  useEffect(() => {
    blockAdsOnThisPage();
    // Immediate redirect - no content rendered
    navigate('/bolivian-blue', { replace: true });
  }, [navigate]);

  // Return null - no content should render
  return null;
}

export default BlueRateBolivia;
