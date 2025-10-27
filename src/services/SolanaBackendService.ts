/**
 * Solana Backend Service Client
 * Handles communication with the Solana microservice backend
 */

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
    this.baseUrl = process.env.REACT_APP_SOLANA_SERVICE_URL || 'http://localhost:3007/api';
  }

  /**
   * Get account balance from backend
   */
  async getBalance(address: string): Promise<BackendResponse<BalanceData>> {
    try {
      const response = await fetch(`${this.baseUrl}/solana/balance/${address}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch balance: ${error}`
      };
    }
  }

  /**
   * Get account information from backend
   */
  async getAccountInfo(address: string): Promise<BackendResponse<AccountInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/solana/account/${address}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch account info: ${error}`
      };
    }
  }

  /**
   * Get token accounts from backend
   */
  async getTokenAccounts(address: string): Promise<BackendResponse<TokenAccount[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/solana/tokens/${address}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch token accounts: ${error}`
      };
    }
  }

  /**
   * Get transaction history from backend
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<BackendResponse<TransactionData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/history/${address}?limit=${limit}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch transaction history: ${error}`
      };
    }
  }

  /**
   * Get transaction details from backend
   */
  async getTransactionDetails(signature: string): Promise<BackendResponse<TransactionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/details/${signature}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch transaction details: ${error}`
      };
    }
  }

  /**
   * Get network information from backend
   */
  async getNetworkInfo(): Promise<BackendResponse<NetworkInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/solana/network`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch network info: ${error}`
      };
    }
  }

  /**
   * Validate address using backend
   */
  async validateAddress(address: string): Promise<BackendResponse<{ address: string; valid: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/solana/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate address: ${error}`
      };
    }
  }

  /**
   * Check if backend service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
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
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Service unavailable: ${error}`
      };
    }
  }
}

// Export singleton instance
export const solanaBackendService = new SolanaBackendService();
export default solanaBackendService;
