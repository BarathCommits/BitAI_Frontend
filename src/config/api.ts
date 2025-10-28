/**
 * Centralized API Configuration for Microservices Architecture
 * Updated to use new microservices endpoints through API Gateway
 * Single source of truth for all API endpoints and settings
 */

// Validate environment variables
const validateEnv = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (!apiUrl) {
    console.warn('⚠️ REACT_APP_API_URL not set, using default microservices gateway');
  }
  
  console.log('🚀 Using microservices architecture with API Gateway');
};

validateEnv();

// Base URL - API Gateway routes to microservices
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Multi-chain wallet support constants
export const WALLET_TYPES = {
  ETHEREUM: 'ethereum',
  SOLANA: 'solana',
  BITCOIN: 'bitcoin',
  COSMOS: 'cosmos',
  POLKADOT: 'polkadot',
  OTHER: 'other'
} as const;

export const CHAIN_IDS = {
  SOLANA_MAINNET: 101,
  SOLANA_TESTNET: 102,
  SOLANA_DEVNET: 103
} as const;

export const DEFAULT_WALLET_TYPE = WALLET_TYPES.SOLANA;
export const DEFAULT_CHAIN_ID = CHAIN_IDS.SOLANA_MAINNET;

/**
 * Complete API Configuration for Microservices
 */
export const API_CONFIG = {
  // Base URL - now points to API Gateway
  BASE_URL,
  
  // Service-specific endpoints
  ENDPOINTS: {
    // Authentication & User Management (Auth Service - Port 3000)
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      NONCE: '/auth/wallet/nonce',
      VERIFY: '/auth/wallet/verify',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      SETTINGS: '/auth/settings',
      ACTIVITY: '/auth/activity',
      STATS: '/auth/stats',
      AVATAR: '/auth/avatar',
      ACCOUNT: '/auth/account',
      EXPORT: '/auth/export',
      NOTIFICATIONS: '/auth/notifications',
      NOTIFICATIONS_UNREAD_COUNT: '/auth/notifications/unread-count',
      NOTIFICATIONS_READ: '/auth/notifications',
      NOTIFICATIONS_READ_ALL: '/auth/notifications/read-all',
      NOTIFICATIONS_PREFERENCES: '/auth/notifications/preferences',
      HEALTH: '/auth/health'
    },
    
    // Vault Management (Vault Service - Port 3002)
    VAULT: {
      INFO: '/vault/info',
      WALLET: '/vault/wallet',
      STATS: '/vault/stats',
      SEARCH: '/vault/search',
      BACKUP: '/vault/backup',
      RESTORE: '/vault/restore',
      ENCRYPT: '/vault/encrypt',
      DECRYPT: '/vault/decrypt',
      BULK_ENCRYPT: '/vault/bulk-encrypt',
      QR: '/qr/master',
      QR_GENERATE: '/qr/master/generate',
      QR_SCAN: '/qr/master/scan',
      HEALTH: '/vault/health'
    },
    
    // Wallet Management (Wallet Service - Port 3003)
    WALLET: {
      CONNECT: '/wallet/connect',
      STATUS: '/wallet/status',
      LIST: '/wallet/list',
      DISCONNECT: '/wallet/disconnect',
      VERIFY: '/wallet/verify',
      HEALTH: '/wallet/health'
    },
    
    // Portfolio Management (Wallet Service - Port 3003)
    PORTFOLIO: {
      OVERVIEW: '/api/portfolio/overview',
      ASSETS: '/api/portfolio/assets',
      HISTORY: '/api/portfolio/history',
      PERFORMANCE: '/api/portfolio/performance',
      TRANSACTIONS: '/api/portfolio/transactions'
    },
    
    // AI Services (AI Service - Port 3004)
    AI: {
      CHAT: '/api/ai/chat',
      DAPP_INTERACTION: '/api/ai/dapp-interaction',
      SUGGESTIONS: '/api/ai/suggestions',
      NATURAL_LANGUAGE: '/api/ai/natural-language',
      PROVIDERS_STATS: '/api/ai/providers/stats',
      HEALTH: '/api/ai/health',
      FEEDBACK: '/api/ai/feedback',
      HISTORY: '/api/ai/history',
      WEB3_COMMAND: '/api/ai/web3-command',
      SESSIONS: '/api/ai/sessions',
      SESSIONS_STATS: '/api/ai/sessions/stats'
    },
    
    // DApp Management (DApp Service - Port 3005)
    DAPPS: {
      LIST: '/api/dapps',
      CONNECT: '/api/dapps/connect',
      DETAILS: '/api/dapps',
      EXECUTE: '/api/dapps/execute',
      SIMULATE: '/api/dapps/simulate',
      TRANSACTIONS: '/api/dapps/transactions',
      USER_TRANSACTIONS: '/api/dapps/user/transactions',
      ENGINE_HEALTH: '/api/dapps/engine/health',
      EXECUTION_STATUS: '/api/dapps/execution',
      UPLOAD: '/api/dapps/upload',
      MY_APPS: '/api/dapps/developer',
      STATS: '/api/dapps/stats/overview',
      APPROVE: '/api/dapps',
      REJECT: '/api/dapps',
      ARCHIVE: '/api/dapps',
      HEALTH: '/api/dapps/health'
    },
    
    // Analytics (Analytics Service - Port 3006)
    ANALYTICS: {
      EVENTS: '/api/analytics/events',
      STATS: '/api/analytics/stats',
      EVENTS_COUNTS: '/api/analytics/events/counts',
      USER_ACTIVITY: '/api/analytics/user/activity',
      RESET_PROVIDER: '/api/analytics/reset',
      RESET: '/api/analytics/reset',
      SESSIONS: '/api/analytics/sessions',
      SERVICE_HEALTH: '/api/analytics/service-health',
      PERFORMANCE: '/api/analytics/performance',
      HEALTH: '/api/analytics/health'
    },
    
    // Solana Backend (Solana Service - Port 3007)
    SOLANA: {
      BALANCE: '/api/solana/balance',
      ACCOUNT: '/api/solana/account',
      TOKENS: '/api/solana/tokens',
      TRANSACTIONS: '/api/solana/transactions',
      NETWORK: '/api/solana/network',
      VALIDATE: '/api/solana/validate',
      CONTEXT: '/api/solana/context',
      HEALTH: '/api/solana/health'
    },
    
    // Health Checks
    HEALTH: {
      GATEWAY: '/health',
      AUTH: '/api/v1/auth/health',
      VAULT: '/api/v1/vault/health',
      WALLET: '/api/v1/wallet/health',
      AI: '/api/ai/health',
      DAPPS: '/api/dapps/health',
      ANALYTICS: '/api/analytics/health'
    }
  },
  
  // Request Configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
} as const;

// Legacy API endpoints for backward compatibility
export const LEGACY_API_ENDPOINTS = {
  // Old monolithic endpoints (for reference)
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    NONCE: '/api/auth/wallet/nonce',
    VERIFY: '/api/auth/wallet/verify',
    REGISTER: '/api/auth/register'
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
    SETTINGS: '/api/v1/users/settings',
    ACTIVITY: '/api/v1/users/activity',
    STATS: '/api/v1/users/stats',
    AVATAR: '/api/v1/users/avatar',
    ACCOUNT: '/api/v1/users/account',
    EXPORT: '/api/v1/users/export'
  },
  VAULT: {
    INFO: '/api/v1/vault/info',
    WALLET: '/api/v1/vault/wallet',
    STATS: '/api/v1/vault/stats',
    SEARCH: '/api/v1/vault/search',
    BACKUP: '/api/v1/vault/backup',
    RESTORE: '/api/v1/vault/restore',
    ENCRYPT: '/api/v1/vault/encrypt',
    DECRYPT: '/api/v1/vault/decrypt',
    QR: '/api/v1/qr/master'
  },
  WALLET: {
    CONNECT: '/api/v1/wallet/connect',
    STATUS: '/api/v1/wallet/status',
    LIST: '/api/v1/wallet/list',
    DISCONNECT: '/api/v1/wallet/disconnect',
    VERIFY: '/api/v1/wallet/verify'
  },
  AI: {
    CHAT: '/api/ai/chat',
    DAPP_INTERACTION: '/api/ai/dapp-interaction',
    SUGGESTIONS: '/api/ai/suggestions'
  },
  DAPPS: {
    LIST: '/api/v1/dapps/list',
    DETAILS: '/api/v1/dapps',
    EXECUTE: '/api/v1/dapps/execute',
    SIMULATE: '/api/v1/dapps/simulate',
    TRANSACTIONS: '/api/v1/dapps/transactions',
    USER_TRANSACTIONS: '/api/v1/dapps/user/transactions',
    ENGINE_HEALTH: '/api/v1/dapps/health/engine',
    EXECUTION_STATUS: '/api/v1/dapps/execution'
  },
  USAGE: {
    TRACK: '/api/v1/usage/track',
    STATS: '/api/v1/usage/stats',
    PROVIDER: '/api/v1/usage',
    CHECK: '/api/v1/usage/check',
    RESET_PROVIDER: '/api/v1/usage/reset',
    RESET: '/api/v1/usage/reset'
  },
  CHAT: {
    SESSIONS: '/api/v1/chat/sessions',
    SESSIONS_DETAILS: '/api/v1/chat/sessions',
    SESSIONS_CREATE: '/api/v1/chat/sessions',
    SESSIONS_MESSAGES: '/api/v1/chat/sessions',
    SESSIONS_TITLE: '/api/v1/chat/sessions',
    SESSIONS_CLEAR: '/api/v1/chat/sessions',
    SESSIONS_ARCHIVE: '/api/v1/chat/sessions',
    SESSIONS_DELETE: '/api/v1/chat/sessions',
    SESSIONS_STATS: '/api/v1/chat/sessions/stats'
  },
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
    READ: '/api/v1/notifications',
    READ_ALL: '/api/v1/notifications/read-all',
    DELETE: '/api/v1/notifications',
    CREATE: '/api/v1/notifications',
    PREFERENCES: '/api/v1/notifications/preferences'
  },
  HEALTH: '/api/v1/health'
};

// Helper function to get full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${BASE_URL}${endpoint}`;
};

// Helper function to get service health check URL
export const getServiceHealthUrl = (service: keyof typeof API_CONFIG.ENDPOINTS.HEALTH): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.HEALTH[service]);
};

// Helper function to check if we're using the new microservices architecture
export const isMicroservicesArchitecture = (): boolean => {
  return BASE_URL.includes('8080') && !BASE_URL.includes('/api/v1');
};

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = (token?: string): HeadersInit => {
  const authToken = token || localStorage.getItem('jwtToken');
  
  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

/**
 * Get headers with wallet address
 */
export const getWalletHeaders = (walletAddress?: string): HeadersInit => {
  const address = walletAddress || localStorage.getItem('walletAddress');
  const token = localStorage.getItem('jwtToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(address && { 'X-Wallet-Address': address }),
  };
};

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get environment name
 */
export const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

// Backward compatibility exports
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
export const API_BASE_URL = BASE_URL;

export default API_CONFIG;


