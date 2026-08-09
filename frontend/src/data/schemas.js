/**
 * Structured data schemas for SEO.
 * Organization / WebSite live in utils/seoSchema — re-exported here for older imports.
 */
export {
  getOrganizationSchema,
  getWebSiteSchema,
  BASE_URL,
  PUBLISHER_ORG,
} from '../utils/seoSchema.js';

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
    }
  ]
});

export const getExchangeRateSchema = (currentRate) => {
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
