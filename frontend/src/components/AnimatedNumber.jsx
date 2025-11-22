import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * AnimatedNumber - Smoothly animates number changes with spring physics
 * Perfect for currency conversions, counters, and live data displays
 */
export default function AnimatedNumber({ value, decimals = 2, prefix = '', suffix = '', className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  
  // Spring animation for smooth number transitions
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    mass: 1
  });
  
  useEffect(() => {
    spring.set(value);
    prevValueRef.current = value;
  }, [value, spring]);
  
  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });
    
    return unsubscribe;
  }, [spring]);
  
  const formattedValue = typeof displayValue === 'number' 
    ? displayValue.toFixed(decimals)
    : '0.00';
  
  return (
    <motion.span
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      key={value} // Re-trigger animation on value change
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}

