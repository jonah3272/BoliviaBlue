import Redirect from '../components/Redirect';

/**
 * This page redirects to /bolivian-blue (canonical page)
 * Uses Redirect component which includes proper canonical tags
 */
function BlueDolarBolivia() {
  return <Redirect to="/bolivian-blue" />;
}

export default BlueDolarBolivia;
