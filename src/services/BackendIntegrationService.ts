/**
 * Backend Integration Service
 * 
 * This service provides a unified interface to interact with the new Safe backend APIs.
 * It handles authentication, wallet management, vault operations, and error handling.
 */

import { API_CONFIG } from '../config/api';

// Types
export interface BackendAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface WalletData {
  walletId: string;
  address: string;
  provider: string;
  chainId: number;
  connectedAt: string;
  isActive: boolean;
  isNewConnection?: boolean;
}

export interface WalletStatus {
  isConnected: boolean;
  walletInfo?: WalletData;
}

export interface VaultData {
  vaultId: string;
  type: string;
  fields: Record<string, any>;
  createdAt: string;
}

export interface VaultStoreRequest {
  type: string;
  value: string;
  fields: Record<string, any>;
  isEncrypted: boolean;
}

class BackendIntegrationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<BackendAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<BackendAPIResponse<AuthData>> {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await this.handleResponse<AuthData>(response);
      
      if (result.success && result.data?.token) {
        localStorage.setItem('jwtToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        console.log('✅ Login successful, token stored');
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  async register(email: string, password: string, username: string): Promise<BackendAPIResponse<AuthData>> {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const result = await this.handleResponse<AuthData>(response);
      
      if (result.success && result.data?.token) {
        localStorage.setItem('jwtToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        console.log('✅ Registration successful, token stored');
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    console.log('✅ Logout successful, token cleared');
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Wallet Methods
  async connectWallet(address: string, provider: string, chainId: number): Promise<BackendAPIResponse<WalletData>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET.CONNECT}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ address, provider, chainId }),
      });

      const result = await this.handleResponse<WalletData>(response);
      
      if (result.success) {
        console.log('✅ Wallet connected and stored in backend:', result.data);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Wallet connection failed' 
      };
    }
  }

  async getWalletStatus(): Promise<BackendAPIResponse<WalletStatus>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET.STATUS}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<WalletStatus>(response);
      
      if (result.success) {
        console.log('✅ Wallet status retrieved:', result.data);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get wallet status' 
      };
    }
  }

  async getAllWallets(): Promise<BackendAPIResponse<WalletData[]>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/wallet/list`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<WalletData[]>(response);
      
      if (result.success) {
        console.log('✅ All wallets retrieved:', result.data);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get wallets' 
      };
    }
  }

  async disconnectWallet(): Promise<BackendAPIResponse<void>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/wallet/disconnect`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<void>(response);
      
      if (result.success) {
        console.log('✅ Wallet disconnected from backend');
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet' 
      };
    }
  }

  async verifyWalletSignature(address: string, message: string, signature: string): Promise<BackendAPIResponse<{ verified: boolean }>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/wallet/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ address, message, signature }),
      });

      const result = await this.handleResponse<{ verified: boolean }>(response);
      
      if (result.success) {
        console.log('✅ Wallet signature verified:', result.data?.verified);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to verify wallet signature' 
      };
    }
  }

  // Vault Methods
  async storePII(type: string, value: string, fields: Record<string, any>): Promise<BackendAPIResponse<VaultData>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ type, value, fields, isEncrypted: true }),
      });

      const result = await this.handleResponse<VaultData>(response);
      
      if (result.success) {
        console.log('✅ PII data stored in vault:', result.data);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to store PII data' 
      };
    }
  }

  async retrievePII(): Promise<BackendAPIResponse<VaultData[]>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault/retrieve`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<VaultData[]>(response);
      
      if (result.success) {
        console.log('✅ PII data retrieved from vault:', result.data);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve PII data' 
      };
    }
  }

  // Utility Methods
  async testConnection(): Promise<BackendAPIResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{ status: string; timestamp: string }>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Backend connection test failed' 
      };
    }
  }

  // Error handling helper
  handleError(error: any, context: string): string {
    console.error(`❌ ${context}:`, error);
    
    if (error?.response?.status === 401) {
      this.logout();
      return 'Authentication expired. Please login again.';
    }
    
    if (error?.response?.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }
    
    if (error?.response?.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (error?.response?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error?.message || `An error occurred in ${context}`;
  }
}

// Export singleton instance
export const backendService = new BackendIntegrationService();
