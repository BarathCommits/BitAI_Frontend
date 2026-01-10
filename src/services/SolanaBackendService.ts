/**
 * Solana Backend Service Client
 * 
 * Handles communication with the Solana microservice backend.
 * 
 * Features:
 * - Balance fetching
 * - Account information
 * - Transaction data
 * - Network information
 * 
 * Used by wallet services and Solana-related components.
 */
import { logger } from '../utils/logger';

interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
}

interface BalanceData {
  lamports: number;
  sol: number;
  formatted: string;
  cached?: boolean;
}

interface AccountInfo {
  address: string;
  balance: number;
  executable: boolean;
  owner: string;
  space: number;
  dataLength: number;
}

interface TokenAccount {
  pubkey: string;
  mint: string;
  amount: number;
  decimals: number;
}

interface TransactionData {
  signature: string;
  slot: number;
  blockTime: number;
  fee: number;
  success: boolean;
  type?: string;
  amount?: number;
  recipient?: string;
  explorerUrl: string;
}

interface NetworkInfo {
  slot: number;
  epoch: number;
  epochProgress: string;
  clusterVersion: string;
  rpcEndpoint: string;
}

class SolanaBackendService {
  private baseUrl: string;

  constructor() {
    // Use direct backend connection with CORS proxy if needed
    // Note: This requires the backend to allow requests from http://localhost:3001
    this.baseUrl = process.env.REACT_APP_SOLANA_API_URL || 'http://localhost:3007';
  }

  /**
   * Safely parse JSON response, handling HTML error pages
   */
  private async parseJSONResponse<T>(response: Response): Promise<BackendResponse<T>> {
    const contentType = response.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');

    if (!isJSON) {
      // Response is not JSON (likely HTML error page)
      const text = await response.text();
      logger.warn('SolanaBackendService: Received non-JSON response:', {
        status: response.status,
        contentType,
        preview: text.substring(0, 200)
      });
      
      return {
        success: false,
        error: response.status === 503 || response.status === 429
          ? 'Service temporarily unavailable. Please try again later.'
          : response.status === 404
          ? 'Service endpoint not found.'
          : `Service error (${response.status}). Please try again later.`
      };
    }

    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      logger.error('SolanaBackendService: Failed to parse JSON response:', parseError);
      return {
        success: false,
        error: 'Failed to parse server response'
      };
    }
  }

  /**
   * Get account balance from backend
   */
  async getBalance(address: string): Promise<BackendResponse<BalanceData>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/balance/${address}`);
      return await this.parseJSONResponse<BalanceData>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get account information from backend
   */
  async getAccountInfo(address: string): Promise<BackendResponse<AccountInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/account/${address}`);
      return await this.parseJSONResponse<AccountInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch account info: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get token accounts from backend
   */
  async getTokenAccounts(address: string): Promise<BackendResponse<TokenAccount[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/tokens/${address}`);
      return await this.parseJSONResponse<TokenAccount[]>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch token accounts: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get transaction history from backend
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<BackendResponse<TransactionData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/transactions/${address}?limit=${limit}`);
      return await this.parseJSONResponse<TransactionData[]>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch transaction history: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get transaction details from backend
   */
  async getTransactionDetails(signature: string): Promise<BackendResponse<TransactionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/transactions/details/${signature}`);
      return await this.parseJSONResponse<TransactionData>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch transaction details: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get network information from backend
   */
  async getNetworkInfo(): Promise<BackendResponse<NetworkInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/network`);
      return await this.parseJSONResponse<NetworkInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch network info: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate address using backend
   */
  async validateAddress(address: string): Promise<BackendResponse<{ address: string; valid: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solana/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      return await this.parseJSONResponse<{ address: string; valid: boolean }>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate address: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Check if backend service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return false;
      }
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<BackendResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await this.parseJSONResponse<any>(response);
    } catch (error) {
      return {
        success: false,
        error: `Service unavailable: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get program accounts (placeholder - not yet implemented in backend)
   */
  async getProgramAccounts(programId: string): Promise<BackendResponse<Array<{ pubkey: string; owner: string; space: number }>>> {
    // TODO: Implement when backend endpoint is available
    return {
      success: false,
      error: 'Program accounts feature not yet available. Please check back later.'
    };
  }

  /**
   * Get account data (placeholder - not yet implemented in backend)
   */
  async getAccountData(accountAddress: string): Promise<BackendResponse<{ address: string; owner: string; executable: boolean; lamports: number; space: number; dataLength: number }>> {
    // TODO: Implement when backend endpoint is available
    // For now, use getAccountInfo as fallback
    const accountInfo = await this.getAccountInfo(accountAddress);
    if (accountInfo.success && accountInfo.data) {
      return {
        success: true,
        data: {
          address: accountInfo.data.address,
          owner: accountInfo.data.owner,
          executable: accountInfo.data.executable,
          lamports: accountInfo.data.balance * 1e9, // Convert SOL to lamports
          space: accountInfo.data.space,
          dataLength: accountInfo.data.dataLength
        }
      };
    }
    return {
      success: false,
      error: accountInfo.error || 'Failed to fetch account data'
    };
  }
}

// Export singleton instance
export const solanaBackendService = new SolanaBackendService();
export default solanaBackendService;
