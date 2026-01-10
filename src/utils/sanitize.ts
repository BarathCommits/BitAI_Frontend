/**
 * Input sanitization utilities
 * Prevents XSS attacks and validates user inputs
 */

/**
 * Sanitize HTML string to prevent XSS
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    return html;
  }

  // Create a temporary div element
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Sanitize user input string
 * Removes potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
};

/**
 * Validate and sanitize wallet address
 */
export const sanitizeWalletAddress = (address: string): string | null => {
  if (!address || typeof address !== 'string') {
    return null;
  }

  // Remove whitespace and convert to lowercase
  const cleaned = address.trim().toLowerCase();

  // Validate Ethereum address format (0x followed by 40 hex characters)
  if (/^0x[a-f0-9]{40}$/.test(cleaned)) {
    return cleaned;
  }

  // Validate Solana address format (base58, typically 32-44 characters)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Validate email format
 */
export const sanitizeEmail = (email: string): string | null => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http, https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Escape special characters for use in regex
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate message length
 */
export const validateMessageLength = (message: string, maxLength: number = 10000): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  return message.length <= maxLength && message.length > 0;
};




