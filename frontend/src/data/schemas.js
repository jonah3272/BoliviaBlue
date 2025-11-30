/**
 * Structured data schemas for SEO
 */

export const getOrganizationSchema = (language) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bolivia Blue con Paz",
  "alternateName": "Bolivia Blue with Paz",
  "url": "https://boliviablue.com",
  "logo": "https://boliviablue.com/favicon.svg",
  "description": language === 'es' 
    ? "Bolivia blue rate y bolivia blue exchange rate - Plataforma de seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia"
    : "Bolivia blue rate and bolivia blue exchange rate - Real-time tracking platform for the blue dollar exchange rate in Bolivia",
  "keywords": language === 'es'
    ? "bolivia blue rate, bolivia blue exchange rate, dólar blue bolivia, tipo de cambio bolivia"
    : "bolivia blue rate, bolivia blue exchange rate, blue dollar bolivia, exchange rate bolivia",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["Spanish", "English"]
  }
});

export const getFAQSchema = (language) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": language === 'es' ? [
    {
      "@type": "Question",
      "name": "¿Qué es el Bolivian Blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Bolivian Blue (también conocido como Bolivia blue rate o bolivia blue exchange rate) es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. Este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial. El Bolivian Blue se actualiza cada 15 minutos en nuestra plataforma."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el Bolivia blue rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Bolivia blue rate es el tipo de cambio del dólar estadounidense en el mercado paralelo de Bolivia. También conocido como bolivia blue exchange rate, este valor refleja la tasa real a la que los bolivianos intercambian dólares fuera del sistema bancario oficial."
      }
    },
    {
      "@type": "Question",
      "name": "¿Con qué frecuencia se actualiza el bolivia blue exchange rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El bolivia blue exchange rate se actualiza cada 15 minutos utilizando datos en tiempo real de Binance P2P, proporcionando la información más precisa y actualizada sobre el tipo de cambio."
      }
    },
    {
      "@type": "Question",
      "name": "¿De dónde proviene el bolivia blue rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El bolivia blue rate proviene de datos públicos de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado paralelo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es la diferencia entre el bolivia blue rate y la tasa oficial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El bolivia blue rate refleja el mercado paralelo y puede diferir significativamente de la tasa oficial del Banco Central de Bolivia. La tasa oficial es fija o se ajusta muy raramente, mientras que el bolivia blue exchange rate fluctúa según la oferta y demanda del mercado."
      }
    },
    {
      "@type": "Question",
      "name": "¿Por qué es importante conocer el bolivia blue rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Conocer el bolivia blue rate es importante porque refleja la realidad del mercado cambiario boliviano y es utilizado por millones de bolivianos para transacciones diarias. Te ayuda a tomar mejores decisiones financieras y entender el verdadero valor del dólar en Bolivia."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto es $100 USD en Bolivia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Con el bolivia blue rate actual (aproximadamente 10.50 BOB por USD), $100 USD equivalen a aproximadamente 1,050 BOB. Con la tasa oficial (~9.00 BOB/USD) serían solo 900 BOB. La diferencia puede ser significativa, por eso es importante usar el bolivia blue exchange rate para obtener el mejor valor. Usa nuestra calculadora para obtener el cálculo exacto con la tasa actual."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto es 1 USD a 1 Boliviano?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El bolivia blue exchange rate actualmente fluctúa entre 10.00 y 11.50 BOB por USD, con un promedio de aproximadamente 10.50 BOB por USD. Esto significa que 1 USD equivale a aproximadamente 10.50 BOB, mientras que 1 BOB equivale a aproximadamente 0.095 USD. El bolivia blue rate se actualiza cada 15 minutos en nuestra plataforma."
      }
    }
  ] : [
    {
      "@type": "Question",
      "name": "What is Bolivian Blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Bolivian Blue (also known as Bolivia blue rate or bolivia blue exchange rate) is the exchange rate of the US dollar in Bolivia's parallel market. This value reflects the real rate at which Bolivians exchange dollars outside the official banking system. The Bolivian Blue is updated every 15 minutes on our platform."
      }
    },
    {
      "@type": "Question",
      "name": "What is Bolivia blue rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Bolivia blue rate is the exchange rate of the US dollar in Bolivia's parallel market. Also known as the bolivia blue exchange rate, this value reflects the real rate at which Bolivians exchange dollars outside the official banking system."
      }
    },
    {
      "@type": "Question",
      "name": "How often is the bolivia blue exchange rate updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The bolivia blue exchange rate is updated every 15 minutes using real-time data from Binance P2P, providing the most accurate and up-to-date exchange rate information."
      }
    },
    {
      "@type": "Question",
      "name": "Where does the bolivia blue rate come from?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The bolivia blue rate comes from public Binance P2P data for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the parallel market."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between bolivia blue rate and the official rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The bolivia blue rate reflects the parallel market and can differ significantly from the official rate set by the Central Bank of Bolivia. The official rate is fixed or adjusted very rarely, while the bolivia blue exchange rate fluctuates according to market supply and demand."
      }
    }
  ]
});

export const getExchangeRateSchema = (currentRate, language) => {
  if (!currentRate) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "ExchangeRateSpecification",
    "currency": "BOB",
    "currentExchangeRate": {
      "@type": "UnitPriceSpecification",
      "price": currentRate.buy || currentRate.buy_bob_per_usd,
      "priceCurrency": "BOB",
      "referenceQuantity": {
        "@type": "QuantitativeValue",
        "value": "1",
        "unitCode": "USD"
      }
    }
  };
};

