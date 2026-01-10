/**
 * Vault Service
 * 
 * Manages vault data (personal information) with backend MongoDB storage.
 * 
 * Features:
 * - CRUD operations for vault items
 * - Rate limiting for API calls
 * - QR code generation for vault data
 * - Backend API integration
 * - Authentication via JWT tokens
 * 
 * Used by useVault hook and VaultPage component.
 */
import { PersonalInfo } from '../types';
import { API_CONFIG, API_BASE_URL } from '../config/api';
import { vaultLogger as logger } from '../utils/logger';

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
  metadata?: {
    itemId?: string;
    itemType?: string;
    createdAt?: string;
    expiresAt?: string;
    walletAddress?: string;
    summary?: string;
  };
}

class VaultService {
  private static lastApiCallTime = 0;
  private static readonly API_RATE_LIMIT_MS = 1000; // 1 second between vault API calls
  private static useLocalStorage = false; // Track if we should use localStorage
  private static backendChecked = false; // Track if we've checked backend availability

  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - VaultService.lastApiCallTime;
    
    if (timeSinceLastCall < VaultService.API_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((VaultService.API_RATE_LIMIT_MS - timeSinceLastCall) / 1000);
      logger.debug(`⏳ VaultService Rate limiting: Please wait ${waitTime} second(s) before making another vault API call`);
      return false;
    }
    
    // Only update timestamp if we're actually making the call
    // This prevents race conditions
    return true;
  }

  private updateRateLimitTimestamp(): void {
    VaultService.lastApiCallTime = Date.now();
  }

  private async checkBackendAvailable(): Promise<boolean> {
    // Only check once
    if (VaultService.backendChecked) {
      return !VaultService.useLocalStorage;
    }

    VaultService.backendChecked = true;
    VaultService.useLocalStorage = false; // Always use backend, no localStorage
    
    logger.debug('✅ VaultService: Using backend API (MongoDB)');
    return true;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    const walletAddress = localStorage.getItem('walletAddress');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Always send wallet address for MongoDB filtering
    if (walletAddress) {
      headers['X-Wallet-Address'] = walletAddress;
    }
    
    // Send token if available (or dev bypass)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Get the current wallet address
  private getWalletAddress(): string | null {
    // First check localStorage
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (walletAddress) {
      return walletAddress;
    }
    
    // If not in localStorage, try to get it from the persisted wallet storage
    try {
      const walletStorage = localStorage.getItem('wallet-storage');
      if (walletStorage) {
        const walletState = JSON.parse(walletStorage);
        
        // Try to get address from main walletInfo
        if (walletState.state?.walletInfo?.address) {
          const address = walletState.state.walletInfo.address;
          // Save it to localStorage for next time
          localStorage.setItem('walletAddress', address);
          logger.debug('💾 Restored wallet address from persisted storage:', address);
          return address;
        }
        
        // Try to get address from connectedWallets
        if (walletState.state?.connectedWallets && walletState.state.connectedWallets.length > 0) {
          const address = walletState.state.connectedWallets[0].address;
          if (address) {
            // Save it to localStorage for next time
            localStorage.setItem('walletAddress', address);
            logger.debug('💾 Restored wallet address from connectedWallets:', address);
            return address;
          }
        }
      }
    } catch (error) {
      logger.error('Error reading wallet storage:', error);
    }
    
    return null;
  }

  private async handleResponse<T>(response: Response): Promise<VaultAPIResponse<T>> {
    try {
      // Check content type to avoid parsing HTML as JSON
      const contentType = response.headers.get('content-type') || '';
      const isJSON = contentType.includes('application/json');
      
      if (!isJSON) {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        logger.error('❌ VaultService: Received non-JSON response:', {
          status: response.status,
          contentType,
          preview: text.substring(0, 200)
        });
        
        return {
          success: false,
          error: {
            code: this.getErrorCode(response.status),
            message: response.status === 503 || response.status === 429
              ? 'Service temporarily unavailable. Please wait a moment and try again.'
              : response.status === 401
              ? 'Authentication required. Please connect your wallet.'
              : `Server error (${response.status}). Please try again later.`,
            details: []
          },
          timestamp: new Date().toISOString()
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || this.getErrorCode(response.status),
            message: data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`,
            details: data.error?.details || data.details || []
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
      logger.error('❌ VaultService: Error parsing response:', error);
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to parse server response'
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
            message: 'Please wait a moment before making another vault API call'
          },
          timestamp: new Date().toISOString()
        };
      }
      
      this.updateRateLimitTimestamp();

      const token = localStorage.getItem('jwtToken');
      const walletAddress = this.getWalletAddress();
      
      logger.debug('VaultService: Checking auth', { 
        hasToken: !!token, 
        walletAddress 
      });

      if (!walletAddress) {
        logger.debug('VaultService: No wallet address found');
        return {
          success: false,
          error: {
            code: 'WALLET_NOT_CONNECTED',
            message: 'No wallet connected. Please connect your wallet first.'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Fetch from backend MongoDB
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<PersonalInfo[]>(response);
      logger.debug('VaultService: API response from MongoDB', { 
        success: result.success, 
        dataLength: Array.isArray(result.data) ? result.data.length : 'not array',
        error: result.error 
      });
      
      return result;
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
            message: 'Please wait a moment before making another vault API call'
          },
          timestamp: new Date().toISOString()
        };
      }
      
      this.updateRateLimitTimestamp();

      const walletAddress = this.getWalletAddress();
      const token = localStorage.getItem('jwtToken');
      
      logger.debug('🔍 VaultService Debug:', {
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

      // Send data to backend MongoDB
      const backendData = {
        type: info.type,
        label: info.label,
        value: info.value,
        category: info.category || 'personal',
        fields: info.fields || {},
        isEncrypted: false,
        walletAddress // Explicitly include wallet address
      };

      logger.debug('📤 VaultService: Sending data to backend MongoDB:', backendData);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.INFO}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      logger.debug('📥 VaultService: Response status:', response.status);

      return this.handleResponse<PersonalInfo>(response);
    } catch (error) {
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
      logger.debug('📤 VaultService: Updating info in MongoDB:', id);
      
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
      logger.debug('📤 VaultService: Deleting info from MongoDB:', id);
      
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

  // QR Code Generation - Gets from backend OR generates and stores
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

      // Get vault stats from backend
      logger.debug('📊 Fetching vault stats from backend for QR code');
      const statsResponse = await fetch(`${API_BASE_URL}${API_CONFIG.ENDPOINTS.VAULT.STATS}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const statsResult = await this.handleResponse<VaultStats>(statsResponse);

      // Create QR data from backend stats
      const vaultSummary = statsResult.success && statsResult.data
        ? `${statsResult.data.totalItems} items across ${Object.keys(statsResult.data.categories).length} categories`
        : 'Safe Vault';

      // Encode vault data for QR
      const qrData = JSON.stringify({
        walletAddress: walletAddress,
        summary: vaultSummary,
        timestamp: new Date().toISOString()
      });

      // Generate QR code image
      const { generateQRCode } = await import('../utils/qrGenerator');
      const qrCodeDataURL = generateQRCode(qrData, 400);

      logger.debug('📤 Storing QR code in backend MongoDB');
      // Store QR code in backend MongoDB via /api/v1/vault/qr-code/generate endpoint
      const storeResponse = await fetch(`${API_BASE_URL}/vault/qr-code/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const storeResult = await this.handleResponse<{
        qrId: string;
        encryptedData: string;
        expiresAt: string;
        totalItems: number;
        checksum: string;
      }>(storeResponse);

      // Store the QR data locally for display even if backend fails
      const qrDataResponse: QRCodeData = {
        qrCodeDataURL: qrCodeDataURL, // Use locally generated QR image
        qrType: 'master',
        metadata: {
          createdAt: new Date().toISOString(),
          expiresAt: storeResult.success && storeResult.data ? storeResult.data.expiresAt : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddress: walletAddress,
          summary: vaultSummary
        }
      };
      
      if (storeResult.success && storeResult.data) {
        logger.debug('✅ Master QR code stored in backend MongoDB:', storeResult.data.qrId);
      } else {
        logger.warn('⚠️ Backend QR storage failed, using locally generated QR');
      }
      
      return {
        success: true,
        data: qrDataResponse,
        message: 'Master vault QR code generated and stored in backend',
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
