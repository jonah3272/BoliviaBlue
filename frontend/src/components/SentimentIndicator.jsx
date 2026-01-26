import { memo } from 'react';

/**
 * Enhanced Sentiment Indicator with Strength Visualization
 * Shows both direction (up/down/neutral) and strength (0-100)
 * 
 * @param {string} sentiment - 'up', 'down', or 'neutral'
 * @param {number} strength - 0-100, how impactful the news is
 * @param {string} language - 'es' or 'en'
 * @param {boolean} showStrength - Whether to show strength visually (default: true)
 * @param {string} size - 'sm', 'md', or 'lg' (default: 'md')
 */
const SentimentIndicator = memo(function SentimentIndicator({ 
  sentiment, 
  strength = null, 
  language = 'es',
  showStrength = true,
  size = 'md'
}) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      icon: 'text-base',
      badge: 'text-[9px] px-1 py-0.5',
      bar: 'h-0.5'
    },
    md: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'text-lg sm:text-xl',
      badge: 'text-[10px] px-1.5 py-0.5',
      bar: 'h-1'
    },
    lg: {
      container: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'text-2xl sm:text-3xl',
      badge: 'text-xs px-2 py-1',
      bar: 'h-1.5'
    }
  };

  const config = sizeConfig[size];
  const hasStrength = strength !== null && strength !== undefined && strength > 0;

  // Determine strength level for visual styling
  const getStrengthLevel = () => {
    if (!hasStrength) return 'moderate';
    if (strength >= 70) return 'very-strong';
    if (strength >= 50) return 'strong';
    if (strength >= 30) return 'moderate';
    return 'weak';
  };

  const strengthLevel = getStrengthLevel();

  // Get strength label
  const getStrengthLabel = () => {
    if (!hasStrength) return '';
    if (strength >= 80) return language === 'es' ? 'Muy Fuerte' : 'Very Strong';
    if (strength >= 60) return language === 'es' ? 'Fuerte' : 'Strong';
    if (strength >= 40) return language === 'es' ? 'Moderado' : 'Moderate';
    return language === 'es' ? 'Débil' : 'Weak';
  };

  // Get tooltip text
  const getTooltip = () => {
    if (!sentiment || sentiment === 'neutral') {
      return language === 'es' 
        ? 'Neutral - Sin impacto claro en divisas'
        : 'Neutral - No clear currency impact';
    }
    
    const direction = sentiment === 'up'
      ? (language === 'es' ? 'Dólar Subiendo' : 'Dollar Rising')
      : (language === 'es' ? 'Dólar Bajando' : 'Dollar Falling');
    
    if (hasStrength) {
      return `${direction} - ${getStrengthLabel()} (${strength}/100)`;
    }
    
    return direction;
  };

  // Neutral case
  if (!sentiment || sentiment === 'neutral') {
    return (
      <div 
        className={`flex flex-col items-center justify-center ${config.container} rounded-full bg-gray-100 dark:bg-gray-700/50 relative`}
        title={getTooltip()}
      >
        <span className={`${config.icon} text-gray-500 dark:text-gray-400`}>
          ○
        </span>
        {showStrength && hasStrength && (
          <div className="absolute -bottom-1 left-0 right-0 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`${config.bar} bg-gray-500 dark:bg-gray-400 transition-all`}
              style={{ width: `${strength}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Up (positive) case
  if (sentiment === 'up') {
    // Determine intensity based on strength
    const intensity = strengthLevel === 'very-strong' 
      ? 'bg-green-200 dark:bg-green-900/50 border-2 border-green-500 dark:border-green-400'
      : strengthLevel === 'strong'
      ? 'bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-500'
      : 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600';
    
    const iconColor = strengthLevel === 'very-strong'
      ? 'text-green-700 dark:text-green-300'
      : strengthLevel === 'strong'
      ? 'text-green-600 dark:text-green-400'
      : 'text-green-500 dark:text-green-500';

    return (
      <div 
        className={`flex flex-col items-center justify-center ${config.container} rounded-full ${intensity} relative group`}
        title={getTooltip()}
      >
        <span className={`${config.icon} font-bold ${iconColor}`}>
          ↗
        </span>
        {showStrength && hasStrength && (
          <>
            {/* Strength bar at bottom */}
            <div className="absolute -bottom-1 left-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`${config.bar} bg-green-500 dark:bg-green-400 transition-all`}
                style={{ width: `${strength}%` }}
              />
            </div>
            {/* Strength badge on hover (desktop) */}
            <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
              <div className={`${config.badge} bg-gray-900 dark:bg-gray-800 text-white rounded shadow-lg font-semibold`}>
                {strength}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Down (negative) case
  if (sentiment === 'down') {
    const intensity = strengthLevel === 'very-strong'
      ? 'bg-red-200 dark:bg-red-900/50 border-2 border-red-500 dark:border-red-400'
      : strengthLevel === 'strong'
      ? 'bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-500'
      : 'bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600';
    
    const iconColor = strengthLevel === 'very-strong'
      ? 'text-red-700 dark:text-red-300'
      : strengthLevel === 'strong'
      ? 'text-red-600 dark:text-red-400'
      : 'text-red-500 dark:text-red-500';

    return (
      <div 
        className={`flex flex-col items-center justify-center ${config.container} rounded-full ${intensity} relative group`}
        title={getTooltip()}
      >
        <span className={`${config.icon} font-bold ${iconColor}`}>
          ↘
        </span>
        {showStrength && hasStrength && (
          <>
            {/* Strength bar at bottom */}
            <div className="absolute -bottom-1 left-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`${config.bar} bg-red-500 dark:bg-red-400 transition-all`}
                style={{ width: `${strength}%` }}
              />
            </div>
            {/* Strength badge on hover (desktop) */}
            <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
              <div className={`${config.badge} bg-gray-900 dark:bg-gray-800 text-white rounded shadow-lg font-semibold`}>
                {strength}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
});

export default SentimentIndicator;
