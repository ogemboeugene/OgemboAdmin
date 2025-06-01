/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a localized format
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', mergedOptions).format(dateObj);
  } catch (error) {
    console.error('Date format error:', error);
    return date?.toString() || '';
  }
};

/**
 * Format a date to a relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return 'just now';
    }
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 4) {
      return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    }
    
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    }
    
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Relative time format error:', error);
    return date?.toString() || '';
  }
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length) + '...';
};

/**
 * Format a number as a currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (e.g., 'USD')
 * @param {string} locale - Locale code (e.g., 'en-US')
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    console.error('Currency format error:', error);
    return value?.toString() || '';
  }
};

/**
 * Format a number with thousand separators
 * @param {number} value - Number to format
 * @param {number} fractionDigits - Number of decimal places
 * @param {string} locale - Locale code (e.g., 'en-US')
 * @returns {string} - Formatted number
 */
export const formatNumber = (value, fractionDigits = 0, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch (error) {
    console.error('Number format error:', error);
    return value?.toString() || '';
  }
};

/**
 * Convert first letter of each word to uppercase
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};