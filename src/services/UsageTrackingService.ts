/**
 * Usage Tracking Service - Wallet-Based Freemium
 * Tracks AI chat attempts per wallet address and enforces free tier limits
 */

const STORAGE_KEY_PREFIX_USAGE = 'ai_chat_usage_';
const STORAGE_KEY_PREFIX_SUBSCRIPTION = 'subscription_';
const FREE_TIER_LIMIT = 10;

export interface SubscriptionStatus {
  isPro: boolean;
  subscriptionId?: string;
  expiryDate?: string;
  plan?: 'monthly' | 'yearly';
  stripeCustomerId?: string;
  walletAddress: string;
}

class UsageTrackingService {
  /**
   * Get wallet-specific storage keys
   */
  private getWalletKey(walletAddress: string, suffix: string): string {
    return `${STORAGE_KEY_PREFIX_USAGE}${walletAddress}_${suffix}`;
  }

  private getSubscriptionKey(walletAddress: string): string {
    return `${STORAGE_KEY_PREFIX_SUBSCRIPTION}${walletAddress}`;
  }

  /**
   * Get current wallet address from storage
   */
  private getCurrentWalletAddress(): string | null {
    return localStorage.getItem('walletAddress');
  }

  /**
   * Get usage count for a specific wallet
   */
  getUsageCount(walletAddress?: string): number {
    const address = walletAddress || this.getCurrentWalletAddress();
    if (!address) return 0;

    const count = localStorage.getItem(this.getWalletKey(address, 'count'));
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Increment usage count for current wallet
   */
  incrementUsage(walletAddress?: string): number {
    const address = walletAddress || this.getCurrentWalletAddress();
    if (!address) return 0;

    const current = this.getUsageCount(address);
    const newCount = current + 1;
    localStorage.setItem(this.getWalletKey(address, 'count'), newCount.toString());
    
    // Also store last usage timestamp
    localStorage.setItem(this.getWalletKey(address, 'lastUsed'), new Date().toISOString());
    
    return newCount;
  }

  /**
   * Reset usage count for a wallet (for testing or admin)
   */
  resetUsage(walletAddress?: string): void {
    const address = walletAddress || this.getCurrentWalletAddress();
    if (!address) return;

    localStorage.removeItem(this.getWalletKey(address, 'count'));
    localStorage.removeItem(this.getWalletKey(address, 'lastUsed'));
  }

  /**
   * Get remaining free attempts for a wallet
   */
  getRemainingAttempts(walletAddress?: string): number {
    const used = this.getUsageCount(walletAddress);
    const remaining = FREE_TIER_LIMIT - used;
    return Math.max(0, remaining);
  }

  /**
   * Check if wallet has remaining free attempts
   */
  hasRemainingAttempts(walletAddress?: string): boolean {
    return this.getRemainingAttempts(walletAddress) > 0;
  }

  /**
   * Get subscription status for a wallet
   */
  getSubscriptionStatus(walletAddress?: string): SubscriptionStatus {
    const address = walletAddress || this.getCurrentWalletAddress();
    if (!address) {
      return { isPro: false, walletAddress: address || '' };
    }

    const status = localStorage.getItem(this.getSubscriptionKey(address));
    if (!status) {
      return { isPro: false, walletAddress: address };
    }

    try {
      const parsed = JSON.parse(status) as SubscriptionStatus;
      parsed.walletAddress = address;
      
      // Check if subscription is still valid (not expired)
      if (parsed.expiryDate) {
        const expiry = new Date(parsed.expiryDate);
        if (expiry < new Date()) {
          // Subscription expired
          this.clearSubscription(address);
          return { isPro: false, walletAddress: address };
        }
      }
      return parsed;
    } catch {
      return { isPro: false, walletAddress: address };
    }
  }

  /**
   * Set subscription status for a wallet (after successful payment)
   */
  setSubscriptionStatus(status: SubscriptionStatus): void {
    if (!status.walletAddress) {
      console.error('Cannot set subscription: wallet address is required');
      return;
    }

    localStorage.setItem(this.getSubscriptionKey(status.walletAddress), JSON.stringify(status));
  }

  /**
   * Clear subscription status for a wallet
   */
  clearSubscription(walletAddress?: string): void {
    const address = walletAddress || this.getCurrentWalletAddress();
    if (!address) return;

    localStorage.removeItem(this.getSubscriptionKey(address));
  }

  /**
   * Check if wallet can use AI chat (has attempts or Pro subscription)
   */
  canUseAIChat(walletAddress?: string): boolean {
    const subscription = this.getSubscriptionStatus(walletAddress);
    if (subscription.isPro) {
      return true;
    }
    return this.hasRemainingAttempts(walletAddress);
  }

  /**
   * Get usage statistics for a wallet
   */
  getUsageStats(walletAddress?: string) {
    const address = walletAddress || this.getCurrentWalletAddress();
    const used = this.getUsageCount(address);
    const remaining = this.getRemainingAttempts(address);
    const subscription = this.getSubscriptionStatus(address);

    return {
      walletAddress: address,
      used,
      remaining,
      limit: FREE_TIER_LIMIT,
      isPro: subscription.isPro,
      subscription
    };
  }

  /**
   * Check if wallet can use wallet assistance (has attempts or Pro subscription)
   */
  canUseWalletAssistance(walletAddress?: string): boolean {
    return this.canUseAIChat(walletAddress);
  }

  /**
   * Track wallet assistance usage and return if allowed
   */
  trackWalletAssistance(walletAddress?: string): { allowed: boolean; stats: ReturnType<typeof this.getUsageStats> } {
    const stats = this.getUsageStats(walletAddress);
    
    if (stats.isPro) {
      // Pro users have unlimited access
      return { allowed: true, stats };
    }
    
    if (stats.remaining > 0) {
      // Increment usage and return allowed
      this.incrementUsage(walletAddress);
      // Refresh stats after incrementing
      const updatedStats = this.getUsageStats(walletAddress);
      return { allowed: true, stats: updatedStats };
    }
    
    // No remaining attempts
    return { allowed: false, stats };
  }

  /**
   * Get all wallet usage data (for admin/debugging)
   */
  getAllWalletUsage(): Record<string, any> {
    const usage: Record<string, any> = {};
    const walletAddress = this.getCurrentWalletAddress();
    
    if (walletAddress) {
      usage[walletAddress] = this.getUsageStats(walletAddress);
    }
    
    return usage;
  }
}

// Export singleton instance
export const usageTrackingService = new UsageTrackingService();
export default usageTrackingService;

