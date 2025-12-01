import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

const CURRENCY_STORAGE_KEY = 'bolivia-blue-currency';

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    // Load from localStorage or default to USD
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && ['USD', 'BRL', 'EUR'].includes(saved)) {
        return saved;
      }
    }
    return 'USD';
  });

  // Save to localStorage whenever currency changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  }, [currency]);

  const setCurrency = (newCurrency) => {
    if (['USD', 'BRL', 'EUR'].includes(newCurrency)) {
      setCurrencyState(newCurrency);
    } else {
      console.warn(`Invalid currency: ${newCurrency}. Must be USD, BRL, or EUR.`);
    }
  };

  const value = {
    currency,
    setCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

