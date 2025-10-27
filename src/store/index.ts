// Export all stores and selectors
export * from './walletStore';
export * from './authStore';
export * from './appStore';

// Store initialization utility
import { useWalletStore } from './walletStore';
import { useAuthStore } from './authStore';
import { useAppStore } from './appStore';

export const initializeStores = () => {
  // Initialize stores if needed
  // This can be called on app startup to set up any initial state
  console.log('🏪 Stores initialized');
};

// Store reset utility (useful for testing or logout)
export const resetAllStores = () => {
  useWalletStore.getState().disconnectWallet();
  useAuthStore.getState().logout();
  useAppStore.getState().clearError();
  useAppStore.getState().clearNotifications();
};

