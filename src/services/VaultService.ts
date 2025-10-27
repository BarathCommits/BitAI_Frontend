import { PersonalInfo } from '../types';
import { API_CONFIG } from '../config/api';

export interface VaultAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  message?: string;
  timestamp: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VaultStats {
  totalItems: number;
  categories: {
    personal: number;
    financial: number;
    identity: number;
    documents: number;
  };
  lastUpdated: string;
}

export interface QRCodeData {
  qrCodeDataURL: string;
  qrType: 'master' | 'individual';
  metadata: {
    itemId?: string;
    itemType?: string;
    createdAt: string;
    expiresAt?: string;
  };
}

class VaultService {
  private static lastApiCallTime = 0;
  private static readonly API_RATE_LIMIT_MS = 3000; // 3 seconds between any vault API calls

  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - VaultService.lastApiCallTime;
    
    if (timeSinceLastCall < VaultService.API_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((VaultService.API_RATE_LIMIT_MS - timeSinceLastCall) / 1000);
      console.log(`⏳ VaultService Rate limiting: Please wait ${waitTime} second(s) before making another vault API call`);
      return false;
    }
    
    VaultService.lastApiCallTime = now;
    return true;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    const walletAddress = localStorage.getItem('walletAddress');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(walletAddress && { 'X-Wallet-Address': walletAddress }),
    };
  }

  // Get the current wallet address
  private getWalletAddress(): string | null {
    return localStorage.getItem('walletAddress');
  }

  private async handleResponse<T>(response: Response): Promise<VaultAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: this.getErrorCode(response.status),
            message: data.message || `HTTP ${response.status}: ${response.statusText}`,
            details: data.details || []
          },
          timestamp: data.timestamp || new Date().toISOString()
        };
      }

      return {
        success: true,
        data: data.data || data,
        timestamp: data.timestamp || new Date().toISOString(),
        pagination: data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'AUTH_UNAUTHORIZED';
      case 403:
        return 'AUTH_FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 500:
        return 'SERVER_ERROR';
      default:
        return 'NETWORK_ERROR';
    }
  }

  // Wallet-specific methods
  async getVaultByWallet(walletAddress?: string): Promise<VaultAPIResponse<PersonalInfo[]>> {
    try {
      const address = walletAddress || this.getWalletAddress();
      
      if (!address) {
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      const response = await fetch(`${API_BASE_URL}/vault/wallet/${address}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<PersonalInfo[]>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch wallet vault data'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Personal Information CRUD Operations
  async getAllPersonalInfo(): Promise<VaultAPIResponse<PersonalInfo[]>> {
    try {
      // Check rate limiting before making API call
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Please wait before making another vault API call'
          },
          timestamp: new Date().toISOString()
        };
      }

      const token = localStorage.getItem('jwtToken');
      const walletAddress = this.getWalletAddress();
      
      console.log('VaultService: Checking auth', { 
        hasToken: !!token, 
        walletAddress 
      });

      if (!token) {
        console.log('VaultService: No token found, returning auth error');
        return { 
          success: false, 
          error: {
            code: 'AUTH_UNAUTHORIZED',
            message: 'Authentication required. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      if (!walletAddress) {
        console.log('VaultService: No wallet address found');
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<PersonalInfo[]>(response);
      console.log('VaultService: API response', { 
        success: result.success, 
        dataLength: Array.isArray(result.data) ? result.data.length : 'not array',
        error: result.error 
      });
      
      return result;
    } catch (error) {
      // Never return mock data - always require proper authentication and backend
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPersonalInfoById(id: string): Promise<VaultAPIResponse<PersonalInfo>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async addPersonalInfo(info: Omit<PersonalInfo, 'id' | 'createdAt' | 'isEncrypted'>): Promise<VaultAPIResponse<PersonalInfo>> {
    try {
      // Check rate limiting before making API call
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Please wait before making another vault API call'
          },
          timestamp: new Date().toISOString()
        };
      }

      const walletAddress = this.getWalletAddress();
      const token = localStorage.getItem('jwtToken');
      
      console.log('🔍 VaultService Debug:', {
        hasToken: !!token,
        hasWalletAddress: !!walletAddress,
        walletAddress: walletAddress,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
      
      if (!walletAddress) {
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      if (!token) {
        return {
          success: false,
          error: {
            code: 'AUTH_UNAUTHORIZED',
            message: 'No authentication token found. Please reconnect your wallet.'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Send data in the format expected by backend
      const backendData = {
        type: info.type,
        label: info.label,
        value: info.value,
        category: info.category || 'personal',
        fields: info.fields || {},
        isEncrypted: false,
        walletAddress // Explicitly include wallet address
      };

      console.log('📤 VaultService: Sending data to backend:', backendData);
      console.log('📤 VaultService: Headers:', this.getAuthHeaders());

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      console.log('📥 VaultService: Response status:', response.status);
      
      if (!response.ok) {
        // Clone the response so we can read it for debugging without consuming the original
        const responseClone = response.clone();
        try {
          const errorData = await responseClone.json();
          console.log('VaultService: Error response:', errorData);
        } catch (e) {
          console.log('VaultService: Could not parse error response');
        }
      }

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
      // Never return mock data - always require proper authentication and backend
      return {
        success: false,
        error: {
          code: 'ADD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updatePersonalInfo(id: string, info: Partial<PersonalInfo>): Promise<VaultAPIResponse<PersonalInfo>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(info),
      });

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deletePersonalInfo(id: string): Promise<VaultAPIResponse<void>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // QR Code Generation
  async generateMasterQRCode(): Promise<VaultAPIResponse<QRCodeData>> {
    try {
      const walletAddress = this.getWalletAddress();
      
      if (!walletAddress) {
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Generate vault summary for QR code
      const vaultSummary = `Safe Vault - ${new Date().toISOString().split('T')[0]}`;
      
      // Call backend to generate or retrieve QR code
      const response = await fetch(`${API_BASE_URL}/qr/master`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ summary: vaultSummary }),
      });

      const result = await this.handleResponse<{
        id: string;
        qrData: string;
        qrImage: string;
        title: string;
        subtitle: string;
        expiresAt: string;
        createdAt: string;
      }>(response);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: {
            code: 'QR_GENERATION_ERROR',
            message: 'Failed to generate master QR code from backend'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Convert backend response to frontend format
      const qrData: QRCodeData = {
        qrCodeDataURL: result.data.qrImage,
        qrType: 'master',
        metadata: {
          createdAt: result.data.createdAt,
          expiresAt: result.data.expiresAt
        }
      };
      
      console.log('✅ Master QR code generated from backend for wallet:', walletAddress);
      
      return {
        success: true,
        data: qrData,
        message: 'Master vault QR code generated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QR_GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate master QR code'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Individual item QR codes are not supported - only master vault QR codes
  async generateInfoQRCode(infoId: string): Promise<VaultAPIResponse<QRCodeData>> {
    return {
      success: false,
      error: {
        code: 'FEATURE_NOT_SUPPORTED',
        message: 'Individual item QR codes are not available. Please use the master vault QR code instead.'
      },
      timestamp: new Date().toISOString()
    };
  }

  // Vault Statistics
  async getVaultStats(): Promise<VaultAPIResponse<VaultStats>> {
    try {
      const walletAddress = this.getWalletAddress();
      
      if (!walletAddress) {
        // Return empty stats if no wallet connected
        return {
          success: true,
          data: {
            totalItems: 0,
            categories: {
              personal: 0,
              financial: 0,
              identity: 0,
              documents: 0
            },
            lastUpdated: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
      }

      const response = await fetch(`${API_BASE_URL}/vault/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // If endpoint doesn't exist yet (404), return default stats
      if (response.status === 404) {
        return {
          success: true,
          data: {
            totalItems: 0,
            categories: {
              personal: 0,
              financial: 0,
              identity: 0,
              documents: 0
            },
            lastUpdated: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
      }

      return this.handleResponse<VaultStats>(response);
    } catch (error) {
      // Return default stats on error
      return {
        success: true,
        data: {
          totalItems: 0,
          categories: {
            personal: 0,
            financial: 0,
            identity: 0,
            documents: 0
          },
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get wallet-specific statistics
  async getWalletVaultStats(walletAddress?: string): Promise<VaultAPIResponse<VaultStats>> {
    try {
      const address = walletAddress || this.getWalletAddress();
      
      if (!address) {
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      const response = await fetch(`${API_BASE_URL}/vault/wallet/${address}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<VaultStats>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch wallet vault stats'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Search and Filter
  async searchPersonalInfo(query: string, category?: string): Promise<VaultAPIResponse<PersonalInfo[]>> {
    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);

      const response = await fetch(`${API_BASE_URL}/vault/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<PersonalInfo[]>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search personal information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Backup and Restore
  async backupVault(): Promise<VaultAPIResponse<{ backupData: string; backupId: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/backup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{ backupData: string; backupId: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BACKUP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to backup vault'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async restoreVault(backupData: string): Promise<VaultAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/restore`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ backupData }),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESTORE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to restore vault'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Enhanced Encryption/Decryption APIs
  async encryptVaultItem(itemId: string, password: string): Promise<VaultAPIResponse<PersonalInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/encrypt/${itemId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ENCRYPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to encrypt vault item'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async decryptVaultItem(itemId: string, password: string): Promise<VaultAPIResponse<PersonalInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/decrypt/${itemId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DECRYPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to decrypt vault item'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async bulkEncryptVault(password: string): Promise<VaultAPIResponse<{ encryptedCount: number; totalCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/bulk-encrypt`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      return this.handleResponse<{ encryptedCount: number; totalCount: number }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BULK_ENCRYPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to bulk encrypt vault'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Enhanced Backup with Encryption
  async createEncryptedBackup(password: string): Promise<VaultAPIResponse<{ 
    backupData: string; 
    backupId: string;
    encryptedAt: string;
    itemCount: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/backup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      return this.handleResponse<{ 
        backupData: string; 
        backupId: string;
        encryptedAt: string;
        itemCount: number;
      }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BACKUP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create encrypted backup'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async restoreFromBackup(backupData: string, password: string): Promise<VaultAPIResponse<{ restoredCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/restore`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ backupData, password }),
      });

      return this.handleResponse<{ restoredCount: number }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESTORE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to restore from backup'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Legacy methods for backward compatibility
  async encryptInfo(info: string, password: string): Promise<VaultAPIResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/encrypt`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ info, password }),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ENCRYPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to encrypt information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async decryptInfo(encryptedInfo: string, password: string): Promise<VaultAPIResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vault/decrypt`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ encryptedInfo, password }),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DECRYPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to decrypt information'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Note: clearAllData method removed - vault data should persist
}

export const vaultService = new VaultService();
