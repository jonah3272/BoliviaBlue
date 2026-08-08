import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Reusable component for page-specific SEO meta tags
 */
export default function PageMeta({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://boliviablue.com/header-og-image.jpg',
  ogType = 'website',
  noindex = false,
  structuredData
}) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  
  // Detect if we're on stage environment
  const isStage = typeof window !== 'undefined' && (
    window.location.hostname === 'stage.boliviablue.com' ||
    window.location.hostname.includes('stage') ||
    import.meta.env.VITE_ENV === 'stage'
  );
  
  // Auto-add noindex for stage environment
  const shouldNoindex = noindex || isStage;
  
  // Always apex (non-www). Do not let ?lang= create a competing indexed URL:
  // canonical is always the clean path; EN is announced only via hreflang.
  const baseUrl = isStage ? 'https://stage.boliviablue.com' : 'https://boliviablue.com';

  const canonicalPath = (canonical || '/').split('?')[0] || '/';
  const fullCanonical = `${baseUrl}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  const alternateEs = `${baseUrl}${canonicalPath}`;
  const alternateEn =
    canonicalPath === '/'
      ? `${baseUrl}/?lang=en`
      : `${baseUrl}${canonicalPath}?lang=en`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
      {!shouldNoindex && <meta name="robots" content="index, follow" />}

      {/* Application Name for PWA */}
      <meta name="application-name" content="Bolivia Blue" />
      <meta name="apple-mobile-web-app-title" content="Bolivia Blue" />

      {/* Language and Geo */}
      <html lang={language === 'en' ? 'en' : 'es'} />
      <meta name="language" content={language === 'es' ? 'Spanish' : 'English'} />
      <meta name="geo.region" content="BO" />
      <meta name="geo.placename" content="Bolivia" />

      {/* Hreflang: ES = clean path (x-default); EN = ?lang=en alternate only */}
      <link rel="alternate" hrefLang="es" href={alternateEs} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={alternateEs} />

      {/* Open Graph / Facebook — always point to clean canonical, never ?lang= */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={language === 'es' ? 'es_BO' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'es' ? 'en_US' : 'es_BO'} />
      <meta property="og:site_name" content="Bolivia Blue con Paz" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            structuredData.map((data, index) => (
              <script key={index} type="application/ld+json">
                {JSON.stringify(data)}
              </script>
            ))
          ) : (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </>
      )}
    </Helmet>
  );
}

