/**
 * Usage Tracking Hook
 * 
 * Tracks AI chat usage and subscription status.
 * 
 * Features:
 * - Track usage per wallet
 * - Check remaining attempts
 * - Subscription status
 * - Auto-refresh on wallet change
 * 
 * Used in ChatPage for usage limits.
 */
import { useState, useEffect, useCallback } from 'react';
import { usageTrackingService, SubscriptionStatus } from '../services/UsageTrackingService';
import { useBuiltInWallet } from './useBuiltInWallet';

export interface UsageStats {
  walletAddress: string | null;
  used: number;
  remaining: number;
  limit: number;
  isPro: boolean;
  subscription: SubscriptionStatus;
}

export const useUsageTracking = () => {
  const { connectedWallets } = useBuiltInWallet();
  const walletAddress = connectedWallets[0]?.address || null;
  
  const [stats, setStats] = useState<UsageStats>(() => {
    if (!walletAddress) {
      return {
        walletAddress: null,
        used: 0,
        remaining: 0,
        limit: 10,
        isPro: false,
        subscription: { isPro: false, walletAddress: '' }
      };
    }
    return usageTrackingService.getUsageStats(walletAddress);
  });

  const refreshStats = useCallback(() => {
    if (walletAddress) {
      setStats(usageTrackingService.getUsageStats(walletAddress));
    }
  }, [walletAddress]);

  useEffect(() => {
    refreshStats();
  }, [walletAddress, refreshStats]);

  const incrementUsage = useCallback(() => {
    if (walletAddress) {
      usageTrackingService.incrementUsage(walletAddress);
      refreshStats();
    }
  }, [walletAddress, refreshStats]);

  const canUseAIChat = useCallback(() => {
    if (!walletAddress) return false;
    return usageTrackingService.canUseAIChat(walletAddress);
  }, [walletAddress]);

  const hasRemainingAttempts = useCallback(() => {
    if (!walletAddress) return false;
    return usageTrackingService.hasRemainingAttempts(walletAddress);
  }, [walletAddress]);

  const getRemainingAttempts = useCallback(() => {
    if (!walletAddress) return 0;
    return usageTrackingService.getRemainingAttempts(walletAddress);
  }, [walletAddress]);

  return {
    stats,
    incrementUsage,
    canUseAIChat,
    hasRemainingAttempts,
    getRemainingAttempts,
    refreshStats,
    walletAddress
  };
};

