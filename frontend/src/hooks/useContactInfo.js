import { useSelector } from 'react-redux';

/**
 * Custom hook to get site contact information from admin settings
 * @returns {Object} Contact information object with email, phone, address, and URLs
 */
export const useContactInfo = () => {
  const { config: siteConfig } = useSelector((state) => state.siteConfig);

  return {
    email: siteConfig?.contact?.email || 'support@bitsolidus.tech',
    phone: siteConfig?.contact?.phone || '+971 8 244 0234',
    address: siteConfig?.contact?.address || 'Level 12, Al Sila Tower Abu Dhabi Global Market Square Al Maryah Island Abu Dhabi, UAE',
    supportUrl: siteConfig?.contact?.supportUrl || '/faq',
    liveChatUrl: siteConfig?.contact?.liveChatUrl || '/chat',
    socialLinks: {
      facebook: siteConfig?.footer?.socialLinks?.facebook || '',
      twitter: siteConfig?.footer?.socialLinks?.twitter || '',
      linkedin: siteConfig?.footer?.socialLinks?.linkedin || '',
      discord: siteConfig?.footer?.socialLinks?.discord || '',
      instagram: siteConfig?.footer?.socialLinks?.instagram || '',
    },
    // Email branding for emails
    emailBranding: {
      logo: siteConfig?.emailBranding?.logo || null,
      supportEmail: siteConfig?.emailBranding?.supportEmail || siteConfig?.contact?.email || 'support@bitsolidus.tech',
      replyToEmail: siteConfig?.emailBranding?.replyToEmail || siteConfig?.contact?.email || 'support@bitsolidus.tech',
    }
  };
};

/**
 * Utility function to format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Utility function to format address for display
 * @param {string} address - Address to format
 * @returns {string} Formatted address with line breaks
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return address;
};

export default useContactInfo;
