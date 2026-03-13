import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

const Favicon = () => {
  const { config } = useSelector((state) => state.siteConfig);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Get favicon URL from site config
  const faviconUrl = config?.favicon 
    ? (config.favicon.startsWith('http') ? config.favicon : `${API_BASE_URL}${config.favicon}`)
    : '/favicon.ico'; // Default fallback

  useEffect(() => {
    // Update favicon link element
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = faviconUrl;
    } else {
      // Create new link if doesn't exist
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);

  return (
    <Helmet>
      <link rel="icon" href={faviconUrl} />
      {/* Add additional favicon types for better browser support */}
      <link rel="shortcut icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
    </Helmet>
  );
};

export default Favicon;
