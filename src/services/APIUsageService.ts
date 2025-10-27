import { useAuthStore } from '../store/authStore';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ProviderUsage {
  provider: string;
  count: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate: Date;
  lastUsed: Date | null;
  isWithinLimit?: boolean;
}

export interface UsageStats {
  totalProviders: number;
  totalCalls: number;
  totalLimit: number;
  mostUsedProvider: string | null;
  leastUsedProvider: string | null;
  averageUsage: number;
}

class APIUsageService {
  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'An error occurred' };
    }
    return { success: true, data: data.data };
  }

  /**
   * Get API usage for all providers
   */
  async getUsage(): Promise<{ success: boolean; data?: { usage: ProviderUsage[]; totalCalls: number; totalLimit: number; totalRemaining: number }; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.USERS.ACTIVITY}/usage`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Get usage for specific provider
   */
  async getProviderUsage(provider: string): Promise<{ success: boolean; data?: ProviderUsage; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/usage/${provider}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Get usage statistics
   */
  async getStats(): Promise<{ success: boolean; data?: UsageStats; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/usage/stats`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Check if user can make API call for provider
   */
  async checkLimit(provider: string): Promise<{ success: boolean; data?: { allowed: boolean; remaining: number; resetDate: Date }; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/usage/check?provider=${provider}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Track API usage (called internally after AI call)
   */
  async trackUsage(provider: string, amount: number = 1): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/usage/track`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ provider, amount })
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Reset usage (for testing)
   */
  async resetUsage(provider?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = provider 
        ? `${API_BASE_URL}/api/v1/usage/reset/${provider}`
        : `${API_BASE_URL}/api/v1/usage/reset`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }
}

export const apiUsageService = new APIUsageService();

