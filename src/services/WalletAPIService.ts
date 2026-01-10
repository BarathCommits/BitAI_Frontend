/**
 * Wallet API Service
 * Integrates with wallet service (port 3003) for portfolio, swap, transfer, and on-ramp/off-ramp operations
 * Based on WALLET_APIS_INTEGRATION_GUIDE.md
 */

import { API_CONFIG, getAuthHeaders } from '../config/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Portfolio Types
export interface PortfolioBalance {
  totalValue: number;
  totalValueUSD: number;
  assets: PortfolioAsset[];
  chains: Record<string, number>;
}

export interface PortfolioAsset {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: number;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

// Swap Types
export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: any;
  fee: number;
  estimatedFee: string;
}

export interface SwapTransaction {
  transaction: string; // Base64 encoded transaction
  swapId: string;
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  estimatedFee: string;
}

export interface SwapStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount?: string;
  transactionHash?: string;
  error?: string;
}

// Transfer Types
export interface TransferRequest {
  to: string;
  amount: string;
  tokenAddress?: string; // Optional, defaults to native token (SOL)
  chainId: number;
}

export interface TransferTransaction {
  transaction: string; // Base64 encoded transaction
  transferId: string;
  to: string;
  amount: string;
  estimatedFee: string;
}

// On-Ramp/Off-Ramp Types
export interface OnRampRequest {
  walletAddress: string;
  chainId: number;
  fiatAmount: number;
  fiatCurrency: string; // 'USD', 'EUR', etc.
  cryptoCurrency: string; // 'SOL', 'USDC', etc.
}

export interface OnRampResponse {
  orderId: string;
  checkoutUrl: string;
  expiresAt: string;
  fiatAmount: number;
  cryptoAmount: number;
}

export interface OffRampRequest {
  walletAddress: string;
  chainId: number;
  cryptoAmount: string;
  cryptoCurrency: string;
  fiatCurrency: string;
  destinationAddress?: string; // Bank account, etc.
}

export interface OffRampResponse {
  orderId: string;
  checkoutUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  cryptoAmount: string;
  fiatAmount: number;
}

class WalletAPIService {
  private baseUrl: string;

  constructor() {
    // Use wallet service directly (port 3003) or through gateway
    // According to integration guide, wallet service is on port 3003
    // For development, use direct connection; for production, use gateway
    const walletServiceUrl = process.env.REACT_APP_WALLET_SERVICE_URL;
    const apiUrl = process.env.REACT_APP_API_URL;
    
    if (walletServiceUrl) {
      this.baseUrl = walletServiceUrl;
    } else if (apiUrl && !apiUrl.includes('/api/v1')) {
      // If API_URL is gateway without /api/v1, use it
      this.baseUrl = apiUrl;
    } else {
      // Default to wallet service on port 3003
      this.baseUrl = 'http://localhost:3003';
    }
    
    // Ensure base URL doesn't have trailing slash
    this.baseUrl = this.baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || `HTTP_${response.status}`,
            message: data.error?.message || data.message || `Request failed with status ${response.status}`,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // Portfolio Methods
  async getBalance(walletAddress: string, chainId: number = 101): Promise<ApiResponse<PortfolioBalance>> {
    return this.request<PortfolioBalance>(
      `/api/v1/wallet/balance?walletAddress=${walletAddress}&chainId=${chainId}`
    );
  }

  async getPortfolio(walletAddress: string, chainId?: number): Promise<ApiResponse<PortfolioBalance>> {
    const query = chainId 
      ? `?walletAddress=${walletAddress}&chainId=${chainId}`
      : `?walletAddress=${walletAddress}`;
    return this.request<PortfolioBalance>(`/api/v1/wallet/portfolio${query}`);
  }

  // Swap Methods
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippage: number = 0.5,
    walletAddress?: string
  ): Promise<ApiResponse<SwapQuote>> {
    const query = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippage: slippage.toString(),
      ...(walletAddress && { walletAddress }),
    });

    return this.request<SwapQuote>(`/api/v1/wallet/swap/quote?${query.toString()}`);
  }

  async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippage: number = 0.5,
    walletAddress: string
  ): Promise<ApiResponse<SwapTransaction>> {
    return this.request<SwapTransaction>('/api/v1/wallet/swap/execute', {
      method: 'POST',
      body: JSON.stringify({
        inputMint,
        outputMint,
        amount,
        slippage,
        walletAddress,
      }),
    });
  }

  async getSwapStatus(swapId: string): Promise<ApiResponse<SwapStatus>> {
    return this.request<SwapStatus>(`/api/v1/wallet/swap/${swapId}/status`);
  }

  async updateSwapStatus(
    swapId: string,
    status: 'confirmed' | 'failed',
    transactionHash?: string,
    error?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/wallet/swap/${swapId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        transactionHash,
        error,
      }),
    });
  }

  // Transfer Methods
  async createTransfer(request: TransferRequest, walletAddress: string): Promise<ApiResponse<TransferTransaction>> {
    return this.request<TransferTransaction>('/api/v1/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        from: walletAddress,
      }),
    });
  }

  // On-Ramp Methods (Buy Crypto)
  async createOnRampOrder(request: OnRampRequest): Promise<ApiResponse<OnRampResponse>> {
    return this.request<OnRampResponse>('/api/v1/wallet/onramp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOnRampOrderStatus(orderId: string): Promise<ApiResponse<OnRampResponse>> {
    return this.request<OnRampResponse>(`/api/v1/wallet/onramp/${orderId}/status`);
  }

  // Off-Ramp Methods (Sell Crypto)
  async createOffRampOrder(request: OffRampRequest): Promise<ApiResponse<OffRampResponse>> {
    return this.request<OffRampResponse>('/api/v1/wallet/offramp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOffRampOrderStatus(orderId: string): Promise<ApiResponse<OffRampResponse>> {
    return this.request<OffRampResponse>(`/api/v1/wallet/offramp/${orderId}/status`);
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; version?: string }>> {
    return this.request<{ status: string; version?: string }>('/api/v1/wallet/health');
  }
}

export const walletAPIService = new WalletAPIService();

