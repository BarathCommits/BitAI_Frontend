import { errorHandler, ERROR_CODES, ErrorSeverity } from '../utils/errorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface DAppInfo {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  tags: string[];
  isVerified: boolean;
  isConnected: boolean;
  permissions: string[];
  chains: Array<{
    chainId: number;
    chainName: string;
    rpcUrl: string;
  }>;
  metadata: {
    version: string;
    author: string;
    website: string;
    repository?: string;
  };
  aiIntegration: {
    enabled: boolean;
    capabilities: string[];
    supportedActions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DAppExecutionRequest {
  dappId: string;
  action: string;
  parameters: any;
  walletAddress?: string;
  chainId?: number;
  sessionId?: string;
}

export interface DAppExecutionResponse {
  executionId: string;
  status: 'pending' | 'simulating' | 'executing' | 'completed' | 'failed';
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    details?: any;
    estimatedGas?: string;
    gasUsed?: string;
  }>;
  transactionHash?: string;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  estimatedCost?: {
    gasPrice: string;
    gasLimit: string;
    totalCost: string;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetails {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber?: number;
  blockHash?: string;
  timestamp: string;
  details: any;
  executionSteps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'completed' | 'failed';
    gasUsed?: string;
    result?: any;
  }>;
}

export interface UserTransaction {
  id: string;
  dappId: string;
  dappName: string;
  action: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  cost: {
    amount: string;
    currency: string;
  };
  details: any;
}

export interface DAppAPIResponse<T> {
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

export interface DAppListFilters {
  category?: string;
  isVerified?: boolean;
  isConnected?: boolean;
  chainId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

class DAppService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<DAppAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const errorCode = this.getErrorCode(response.status);
        
        errorHandler.handleError(
          new Error(data.message || 'DApp operation failed'),
          {
            component: 'DAppService',
            action: 'handleResponse',
            metadata: { 
              status: response.status, 
              url: response.url, 
              errorCode,
              errorData: data
            },
          },
          ErrorSeverity.MEDIUM
        );
        
        return { 
          success: false, 
          error: {
            code: errorCode,
            message: data.message || 'DApp operation failed',
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
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to parse response'),
        {
          component: 'DAppService',
          action: 'handleResponse',
        },
        ErrorSeverity.HIGH
      );
      
      return { 
        success: false, 
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to process response'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ERROR_CODES.API_VALIDATION_ERROR;
      case 401:
        return ERROR_CODES.AUTH_UNAUTHORIZED;
      case 403:
        return ERROR_CODES.AUTH_FORBIDDEN;
      case 404:
        return ERROR_CODES.API_NOT_FOUND;
      case 500:
        return ERROR_CODES.API_SERVER_ERROR;
      default:
        return ERROR_CODES.API_NETWORK_ERROR;
    }
  }

  // DApp Discovery and Information
  async getDAppList(filters: DAppListFilters = {}): Promise<DAppAPIResponse<DAppInfo[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.isVerified !== undefined) params.append('isVerified', filters.isVerified.toString());
      if (filters.isConnected !== undefined) params.append('isConnected', filters.isConnected.toString());
      if (filters.chainId) params.append('chainId', filters.chainId.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_BASE_URL}/dapp/list?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<DAppInfo[]>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DAPP_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dApp list'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getDAppDetails(dappId: string): Promise<DAppAPIResponse<DAppInfo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/${dappId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<DAppInfo>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DAPP_DETAILS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dApp details'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // DApp Execution
  async executeDAppAction(request: DAppExecutionRequest): Promise<DAppAPIResponse<DAppExecutionResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/execute`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return this.handleResponse<DAppExecutionResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DAPP_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to execute dApp action'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async simulateDAppAction(request: DAppExecutionRequest): Promise<DAppAPIResponse<DAppExecutionResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/simulate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return this.handleResponse<DAppExecutionResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DAPP_SIMULATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to simulate dApp action'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Transaction Monitoring
  async getTransactionDetails(transactionHash: string): Promise<DAppAPIResponse<TransactionDetails>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/transactions/${transactionHash}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<TransactionDetails>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TRANSACTION_DETAILS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch transaction details'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getUserTransactions(limit: number = 20, offset: number = 0): Promise<DAppAPIResponse<UserTransaction[]>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`${API_BASE_URL}/dapp/user/transactions?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserTransaction[]>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_TRANSACTIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user transactions'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Execution Engine Health
  async getExecutionEngineHealth(): Promise<DAppAPIResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    lastCheck: string;
    services: Array<{
      name: string;
      status: 'up' | 'down';
      responseTime: number;
    }>;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/health/engine`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        uptime: number;
        lastCheck: string;
        services: Array<{
          name: string;
          status: 'up' | 'down';
          responseTime: number;
        }>;
      }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check execution engine health'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Real-time Updates (WebSocket support would be added here)
  subscribeToExecutionUpdates(executionId: string, callback: (update: DAppExecutionResponse) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement polling
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dapp/execution/${executionId}/status`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });

        const result = await this.handleResponse<DAppExecutionResponse>(response);
        if (result.success && result.data) {
          callback(result.data);
          
          // Stop polling if execution is complete
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to poll execution status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  }

  subscribeToTransactionUpdates(transactionHash: string, callback: (update: TransactionDetails) => void): () => void {
    // Similar polling implementation for transaction updates
    const interval = setInterval(async () => {
      try {
        const result = await this.getTransactionDetails(transactionHash);
        if (result.success && result.data) {
          callback(result.data);
          
          // Stop polling if transaction is confirmed or failed
          if (result.data.status === 'confirmed' || result.data.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to poll transaction status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }
}

export const dAppService = new DAppService();
