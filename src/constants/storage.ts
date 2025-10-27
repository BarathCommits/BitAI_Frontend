/**
 * LocalStorage Keys Constants
 * Centralized storage keys to prevent typos and enable refactoring
 */

export const STORAGE_KEYS = {
  // Authentication
  JWT_TOKEN: 'jwtToken',
  WALLET_ADDRESS: 'walletAddress',
  USER: 'user',
  USER_STATS: 'userStats',
  
  // Wallet (legacy - old session-based, consider removing)
  WALLET_SESSION_ID: 'wallet_session_id',
  WALLET_TYPE: 'wallet_type',
  
  // Preferences
  SELECTED_AI_PROVIDER: 'selectedAIProvider',
  THEME: 'theme',
  
  // Session Flags
  DEFAULT_EMAIL_ADDED: 'defaultEmailAdded',
  
  // Zustand Persisted Stores
  AUTH_STORAGE: 'auth-storage',
  WALLET_STORAGE: 'wallet-storage',
  APP_STORAGE: 'app-storage',
  
} as const;

/**
 * SessionStorage Keys
 */
export const SESSION_KEYS = {
  DEFAULT_EMAIL_ADDED: 'defaultEmailAdded',
  TEMP_REDIRECT: 'tempRedirect',
} as const;

/**
 * Type-safe storage utility
 */
export const storage = {
  // Get item with type safety
  get: (key: keyof typeof STORAGE_KEYS): string | null => {
    return localStorage.getItem(STORAGE_KEYS[key]);
  },
  
  // Set item
  set: (key: keyof typeof STORAGE_KEYS, value: string): void => {
    localStorage.setItem(STORAGE_KEYS[key], value);
  },
  
  // Remove item
  remove: (key: keyof typeof STORAGE_KEYS): void => {
    localStorage.removeItem(STORAGE_KEYS[key]);
  },
  
  // Clear all auth-related data
  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  },
  
  // Get parsed JSON
  getJSON: <T>(key: keyof typeof STORAGE_KEYS): T | null => {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    if (!item) return null;
    
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },
  
  // Set JSON
  setJSON: <T>(key: keyof typeof STORAGE_KEYS, value: T): void => {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  },
};

/**
 * Session storage utility
 */
export const sessionStorage = {
  get: (key: keyof typeof SESSION_KEYS): string | null => {
    return window.sessionStorage.getItem(SESSION_KEYS[key]);
  },
  
  set: (key: keyof typeof SESSION_KEYS, value: string): void => {
    window.sessionStorage.setItem(SESSION_KEYS[key], value);
  },
  
  remove: (key: keyof typeof SESSION_KEYS): void => {
    window.sessionStorage.removeItem(SESSION_KEYS[key]);
  },
};

export default STORAGE_KEYS;


