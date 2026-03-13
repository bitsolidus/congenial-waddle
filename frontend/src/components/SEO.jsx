import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  type = 'website',
  schema
}) => {
  const siteUrl = 'https://bitsolidus.io';
  const defaultTitle = 'BitSolidus - Secure Cryptocurrency Trading Platform';
  const defaultDescription = 'Trade Bitcoin, Ethereum, and other cryptocurrencies with confidence on BitSolidus. Institutional-grade security, lightning-fast execution, and 24/7 support.';
  const defaultOgImage = 'https://bitsolidus.io/og-image.jpg';

  const pageTitle = title ? `${title} | BitSolidus` : defaultTitle;

  // Default schema if none provided
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BitSolidus",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": defaultDescription,
    "sameAs": [
      "https://twitter.com/bitsolidus",
      "https://linkedin.com/company/bitsolidus",
      "https://github.com/bitsolidus"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@bitsolidus.io",
      "contactType": "customer service"
    }
  };

  const schemaData = schema || defaultSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical ? `${siteUrl}${canonical}` : siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="keywords" content="cryptocurrency, bitcoin, ethereum, crypto trading, blockchain, digital assets, DeFi, crypto exchange" />
      <meta name="author" content="BitSolidus" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
