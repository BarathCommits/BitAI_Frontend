/**
 * Built-in Wallet Hook
 * 
 * React hook for managing built-in wallet connections in Solana.
 * 
 * Features:
 * - Initialize and manage Solana wallet connections
 * - Connect/disconnect wallets
 * - Track connection state
 * - Handle connection timeouts
 * - Auto-refresh wallet list
 * 
 * Used throughout the app for wallet management.
 */
import { useState, useEffect, useCallback } from 'react';
import { builtInWalletService, BuiltInWalletInfo, WalletConnectionResult } from '../services/BuiltInWalletService';
import { notificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

export interface UseBuiltInWalletReturn {
  // Wallet state
  wallets: BuiltInWalletInfo[];
  connectedWallets: BuiltInWalletInfo[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;

  // Wallet actions
  connectWallet: (walletId: string) => Promise<WalletConnectionResult>;
  disconnectWallet: (walletId: string) => Promise<void>;
  refreshWallets: () => void;

  // Utility functions
  isWalletConnected: (walletId: string) => boolean;
  getWalletProvider: (walletId: string) => any;
  clearError: () => void;
}

export const useBuiltInWallet = (): UseBuiltInWalletReturn => {
  const [wallets, setWallets] = useState<BuiltInWalletInfo[]>([]);
  const [connectedWallets, setConnectedWallets] = useState<BuiltInWalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Global connection state to prevent multiple simultaneous connection attempts
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Global connection lock to prevent multiple wallet connections at once
  useEffect(() => {
    // Clear any existing connection state on mount
    setIsConnecting(false);
  }, []);

  // Initialize wallets on mount
  useEffect(() => {
    const initializeWallets = () => {
      try {
        const availableWallets = builtInWalletService.getAvailableWallets();
        const connected = builtInWalletService.getConnectedWallets();
        
        setWallets(availableWallets);
        setConnectedWallets(connected);
        
        logger.debug('✅ Built-in wallets initialized:', availableWallets.length);
      } catch (err) {
        logger.error('❌ Failed to initialize wallets:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize wallets');
      }
    };

    initializeWallets();
  }, []);

  // Listen for wallet changes
  useEffect(() => {
    const unsubscribe = builtInWalletService.addListener((connected) => {
      setConnectedWallets(connected);
      
      // Update wallet availability status
      const updatedWallets = builtInWalletService.getAvailableWallets();
      setWallets(updatedWallets);
    });

    return unsubscribe;
  }, []);

  // Connect to a wallet
  const connectWallet = useCallback(async (walletId: string): Promise<WalletConnectionResult> => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      logger.warn('⚠️ Connection already in progress, skipping...');
      return {
        success: false,
        error: 'Connection already in progress. Please wait...'
      };
    }

    setIsConnecting(true);
    setIsLoading(true);
    setError(null);

    try {
      // Add timeout to prevent hanging
      const connectionPromise = builtInWalletService.connectWallet(walletId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - please try again')), 10000) // Reduced to 10 seconds
      );
      
      const result = await Promise.race([connectionPromise, timeoutPromise]) as WalletConnectionResult;
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 
                           ((result.error as any)?.message || 'Connection failed');
        setError(errorMessage);
        
        // Notify error
        notificationService.error('Connection Failed', errorMessage);
      } else {
        // Update local state immediately after successful connection
        const updatedWallets = builtInWalletService.getAvailableWallets();
        const connected = builtInWalletService.getConnectedWallets();
        setWallets(updatedWallets);
        setConnectedWallets(connected);
        
        // Force a re-render by updating state again after a short delay
        setTimeout(() => {
          const refreshedWallets = builtInWalletService.getAvailableWallets();
          const refreshedConnected = builtInWalletService.getConnectedWallets();
          setWallets(refreshedWallets);
          setConnectedWallets(refreshedConnected);
        }, 200);
        
        // Wallet connection is now handled in connectWalletWithAuth
        // It will attempt to authenticate and get JWT token
        logger.debug('✅ Wallet connected successfully');
        
        // Notify success
        if (result.walletInfo && result.address) {
          notificationService.walletConnected(result.walletInfo.name, result.address);
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsConnecting(false);
    }
  }, [isConnecting]); // Add isConnecting dependency

  // Disconnect a wallet
  const disconnectWallet = useCallback(async (walletId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get wallet info before disconnecting
      const wallet = wallets.find(w => w.id === walletId);
      
      await builtInWalletService.disconnectWallet(walletId);
      
      // Update local state after disconnection
      const updatedWallets = builtInWalletService.getAvailableWallets();
      const connected = builtInWalletService.getConnectedWallets();
      setWallets(updatedWallets);
      setConnectedWallets(connected);
      
      // Notify success
      if (wallet) {
        notificationService.walletDisconnected(wallet.name);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disconnection failed';
      setError(errorMessage);
      notificationService.error('Disconnection Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh wallet list
  const refreshWallets = useCallback(() => {
    try {
      const availableWallets = builtInWalletService.getAvailableWallets();
      const connected = builtInWalletService.getConnectedWallets();
      
      setWallets(availableWallets);
      setConnectedWallets(connected);
    } catch (err) {
      logger.error('❌ Failed to refresh wallets:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh wallets');
    }
  }, []);

  // Check if wallet is connected
  const isWalletConnected = useCallback((walletId: string): boolean => {
    return builtInWalletService.isWalletConnected(walletId);
  }, []);

  // Get wallet provider
  const getWalletProvider = useCallback((walletId: string) => {
    return builtInWalletService.getWalletProvider(walletId);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    wallets,
    connectedWallets,
    isLoading,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshWallets,
    isWalletConnected,
    getWalletProvider,
    clearError,
  };
};
