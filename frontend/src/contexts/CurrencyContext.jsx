import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackCurrencySwitch } from '../utils/analytics';

const CurrencyContext = createContext(null);

const CURRENCY_STORAGE_KEY = 'bolivia-blue-currency';

export const SUPPORTED_CURRENCIES = ['USD', 'BRL', 'EUR', 'COP'];

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
        return saved;
      }
    }
    return 'USD';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  }, [currency]);

  const setCurrency = (newCurrency) => {
    if (SUPPORTED_CURRENCIES.includes(newCurrency)) {
      const prevCurrency = currency;
      setCurrencyState(newCurrency);
      if (prevCurrency !== newCurrency) {
        trackCurrencySwitch(prevCurrency, newCurrency);
      }
    } else {
      console.warn(`Invalid currency: ${newCurrency}. Must be ${SUPPORTED_CURRENCIES.join(', ')}.`);
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
