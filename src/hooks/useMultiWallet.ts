/**
 * Multi-Wallet Hook
 * 
 * Manages multiple wallet connections and operations.
 * 
 * Features:
 * - Fetch all connected wallets
 * - Set primary wallet
 * - Remove wallet
 * - Wallet status tracking
 * 
 * Used in wallet management components.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export interface WalletInfo {
  walletId: string;
  address: string;
  displayAddress: string;
  provider: string;
  chainId: number;
  name?: string;
  balance?: string;
  isPrimary: boolean;
  isActive: boolean;
  connectedAt: Date;
  lastConnectedAt: Date;
}

export const useMultiWallet = () => {
  const { token, isAuthenticated } = useAuthStore();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  /**
   * Fetch all connected wallets
   */
  const fetchWallets = useCallback(async () => {
    if (!isAuthenticated) {
      setWallets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/all`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setWallets(data.data.wallets || []);
      } else {
        setError(data.error?.message || 'Failed to fetch wallets');
        setWallets([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  /**
   * Set wallet as primary
   */
  const setPrimaryWallet = async (walletId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/${walletId}/primary`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWallets(); // Refresh wallet list
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Failed to set primary wallet' };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  /**
   * Remove wallet
   */
  const removeWallet = async (address: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/${address}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWallets(); // Refresh wallet list
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Failed to remove wallet' };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  /**
   * Update wallet details (name, balance)
   */
  const updateWalletDetails = async (
    walletId: string,
    details: { name?: string; balance?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/${walletId}/details`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(details)
      });

      const data = await response.json();

      if (data.success) {
        await fetchWallets(); // Refresh wallet list
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Failed to update wallet' };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  /**
   * Get primary wallet
   */
  const getPrimaryWallet = (): WalletInfo | null => {
    return wallets.find(w => w.isPrimary) || wallets[0] || null;
  };

  // Auto-fetch on mount and auth change
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    isLoading,
    error,
    fetchWallets,
    setPrimaryWallet,
    removeWallet,
    updateWalletDetails,
    getPrimaryWallet,
    count: wallets.length
  };
};


