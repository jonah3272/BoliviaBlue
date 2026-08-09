import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrganizationSchema, getWebSiteSchema } from '../utils/seoSchema';

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
  structuredData,
  /** When true (default), inject sitewide Organization + WebSite brand graph */
  includeBrandSchema = true,
}) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  const isStage = typeof window !== 'undefined' && (
    window.location.hostname === 'stage.boliviablue.com' ||
    window.location.hostname.includes('stage') ||
    import.meta.env.VITE_ENV === 'stage'
  );

  const shouldNoindex = noindex || isStage;

  const baseUrl = isStage ? 'https://stage.boliviablue.com' : 'https://boliviablue.com';

  const canonicalPath = (canonical || '/').split('?')[0] || '/';
  const fullCanonical = `${baseUrl}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  const alternateEs = `${baseUrl}${canonicalPath}`;
  const alternateEn =
    canonicalPath === '/'
      ? `${baseUrl}/?lang=en`
      : `${baseUrl}${canonicalPath}?lang=en`;

  const pageSchemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];
  const brandSchemas = includeBrandSchema
    ? [getOrganizationSchema(language), getWebSiteSchema(language)]
    : [];
  const allSchemas = [...brandSchemas, ...pageSchemas];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
      {!shouldNoindex && <meta name="robots" content="index, follow" />}

      <meta name="application-name" content="Bolivia Blue" />
      <meta name="apple-mobile-web-app-title" content="Bolivia Blue" />

      <html lang={language === 'en' ? 'en' : 'es'} />
      <meta name="language" content={language === 'es' ? 'Spanish' : 'English'} />
      <meta name="geo.region" content="BO" />
      <meta name="geo.placename" content="Bolivia" />

      <link rel="alternate" hrefLang="es" href={alternateEs} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={alternateEs} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={language === 'es' ? 'es_BO' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'es' ? 'en_US' : 'es_BO'} />
      <meta property="og:site_name" content="Bolivia Blue" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullOgImage} />

      {allSchemas.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
