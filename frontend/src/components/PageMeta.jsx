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
  ogImage = 'https://boliviablue.com/og-image.webp',
  ogType = 'website',
  noindex = false,
  structuredData
}) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const baseUrl = 'https://boliviablue.com';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  // Generate hreflang tags
  const currentPath = canonical || '/';
  const alternateEs = `${baseUrl}${currentPath}`;
  const alternateEn = `${baseUrl}${currentPath}${currentPath === '/' ? '?lang=en' : (currentPath.includes('?') ? '&lang=en' : '?lang=en')}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Language and Geo */}
      <meta name="language" content={language === 'es' ? 'Spanish' : 'English'} />
      <meta name="geo.region" content="BO" />
      <meta name="geo.placename" content="Bolivia" />

      {/* Hreflang Tags */}
      <link rel="alternate" hreflang="es" href={alternateEs} />
      <link rel="alternate" hreflang="en" href={alternateEn} />
      <link rel="alternate" hreflang="x-default" href={alternateEs} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" href={fullCanonical} />
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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

