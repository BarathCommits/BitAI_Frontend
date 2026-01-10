/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers/strings
 */

export const APP_CONFIG = {
  // Application Info
  NAME: 'bitPorta',
  VERSION: '1.0.0',
  
  // Rate Limiting
  VAULT: {
    RATE_LIMIT_MS: 1000,
    MAX_RETRIES: 3,
    TIMEOUT_MS: 30000,
  },
  
  // Chat Configuration
  CHAT: {
    DEFAULT_FREE_WALLET_LIMIT: 10,
    MAX_MESSAGE_LENGTH: 10000,
    SESSION_STORAGE_KEY: 'bitai_general_session_id',
  },
  
  // Wallet Configuration
  WALLET: {
    MAX_CONNECTION_ATTEMPTS: 5,
    CONNECTION_TIMEOUT_MS: 10000,
    VALIDATION_RETRY_DELAY_MS: 2000,
  },
  
  // API Configuration
  API: {
    DEFAULT_TIMEOUT_MS: 30000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },
  
  // UI Configuration
  UI: {
    TOAST_DURATION_MS: 4000,
    DEBOUNCE_DELAY_MS: 300,
    ANIMATION_DURATION_MS: 200,
  },
  
  // Security
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
    MAX_SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

// Type-safe access
export type AppConfig = typeof APP_CONFIG;




