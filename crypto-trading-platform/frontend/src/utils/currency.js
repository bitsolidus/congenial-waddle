// Country to Currency mapping
export const countryToCurrency = {
  // Europe
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound' },
  'DE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'FR': { code: 'EUR', symbol: '€', name: 'Euro' },
  'IT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'ES': { code: 'EUR', symbol: '€', name: 'Euro' },
  'NL': { code: 'EUR', symbol: '€', name: 'Euro' },
  'BE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'AT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'PT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'IE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'FI': { code: 'EUR', symbol: '€', name: 'Euro' },
  'GR': { code: 'EUR', symbol: '€', name: 'Euro' },
  'CY': { code: 'EUR', symbol: '€', name: 'Euro' },
  'MT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'SK': { code: 'EUR', symbol: '€', name: 'Euro' },
  'SI': { code: 'EUR', symbol: '€', name: 'Euro' },
  'EE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'LV': { code: 'EUR', symbol: '€', name: 'Euro' },
  'LT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'LU': { code: 'EUR', symbol: '€', name: 'Euro' },
  
  // North America
  'US': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'MX': { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  
  // Asia
  'JP': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'CN': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'KR': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'TH': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  'MY': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  'ID': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  'PH': { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  'VN': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  'HK': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  'TW': { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  
  // Oceania
  'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'NZ': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  
  // Middle East
  'AE': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'SA': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  'QA': { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  'KW': { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  'BH': { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
  'OM': { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  'IL': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  'TR': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  
  // Africa
  'ZA': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  'NG': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  'EG': { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  'KE': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  'GH': { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  
  // South America
  'BR': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'AR': { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  'CL': { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'CO': { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  'PE': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  
  // Others - default to USD
  'DEFAULT': { code: 'USD', symbol: '$', name: 'US Dollar' }
};

// Exchange rates relative to USD (these should be updated regularly via API)
export const exchangeRates = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  MXN: 17.05,
  JPY: 149.50,
  CNY: 7.19,
  INR: 83.12,
  KRW: 1330.50,
  SGD: 1.34,
  THB: 35.80,
  MYR: 4.75,
  IDR: 15650,
  PHP: 55.90,
  VND: 24350,
  HKD: 7.82,
  TWD: 31.45,
  AUD: 1.52,
  NZD: 1.64,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  ILS: 3.70,
  TRY: 30.50,
  ZAR: 18.90,
  NGN: 1550,
  EGP: 30.90,
  KES: 157.50,
  GHS: 12.50,
  BRL: 4.95,
  ARS: 850,
  CLP: 965,
  COP: 3920,
  PEN: 3.75
};

// Get currency info for a country code
export const getCurrencyByCountry = (countryCode) => {
  return countryToCurrency[countryCode] || countryToCurrency.DEFAULT;
};

// Convert USD amount to target currency
export const convertFromUSD = (amountUSD, targetCurrency) => {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountUSD * rate;
};

// Convert from target currency to USD
export const convertToUSD = (amount, fromCurrency) => {
  const rate = exchangeRates[fromCurrency] || 1;
  return amount / rate;
};

// Format currency with symbol
export const formatCurrencyWithSymbol = (amount, currencyCode = 'USD') => {
  const currency = Object.values(countryToCurrency).find(c => c.code === currencyCode) || countryToCurrency.DEFAULT;
  
  // Format based on currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR' ? 0 : 2
  });
  
  return `${currency.symbol}${formatter.format(amount)}`;
};

// Get all available currencies for dropdown
export const getAvailableCurrencies = () => {
  const currencies = new Map();
  Object.values(countryToCurrency).forEach(currency => {
    if (!currencies.has(currency.code)) {
      currencies.set(currency.code, currency);
    }
  });
  return Array.from(currencies.values());
};
