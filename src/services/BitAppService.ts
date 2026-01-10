/**
 * Bit Apps Service
 * Handles all Bit App operations with backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface BitApp {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  logo: string;
  rating: number;
  users: string;
  isVerified: boolean;
  tags: string[];
  isUploaded: boolean;
  uploadDate?: string;
  status?: string;
  uploader?: {
    username: string;
    email: string;
  };
  // Wallet and chain mapping
  walletInfo?: {
    address: string;
    provider: string;
    chainId: number;
    chainName?: string;
  };
}

export interface BitAppAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadAppRequest {
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  walletInfo: {
    address: string;
    provider: string;
    chainId: number;
    chainName?: string;
  };
}

class BitAppService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken') || localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private transformBackendDAppToBitApp(backendDApp: any): BitApp {
    return {
      id: backendDApp.dappId || backendDApp._id || backendDApp.id,
      name: backendDApp.name,
      description: backendDApp.description,
      category: backendDApp.category?.charAt(0).toUpperCase() + backendDApp.category?.slice(1) || 'DeFi',
      url: backendDApp.url,
      logo: this.getCategoryEmoji(backendDApp.category),
      rating: backendDApp.rating || 4.5,
      users: backendDApp.totalUsers || backendDApp.users || '10K+',
      isVerified: backendDApp.isVerified || backendDApp.status?.isActive || true,
      tags: backendDApp.tags || [backendDApp.category],
      isUploaded: backendDApp.isUploaded || false,
      uploadDate: backendDApp.createdAt || backendDApp.uploadDate,
      status: backendDApp.status?.isActive ? 'active' : 'inactive',
      uploader: backendDApp.uploader,
      walletInfo: backendDApp.walletInfo
    };
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'defi': '💰',
      'nft': '🎨',
      'gaming': '🎮',
      'social': '👥',
      'dao': '🏛️',
      'bridge': '🌉',
      'tools': '🛠️',
      'custom': '⚙️'
    };
    return emojiMap[category?.toLowerCase()] || '🔷';
  }

  private async handleResponse<T>(response: Response): Promise<BitAppAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      // Extract apps array from nested response structure
      // Backend returns: { success: true, data: { dapps: [...] } }
      let appsData = data.data?.dapps || data.data?.apps || data.data || data;
      
      // Transform backend dapp format to frontend BitApp format
      if (Array.isArray(appsData)) {
        appsData = appsData.map((app: any) => this.transformBackendDAppToBitApp(app));
      }
      
      return { success: true, data: appsData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Upload a new Bit App
  async uploadApp(appData: UploadAppRequest): Promise<BitAppAPIResponse<BitApp>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(appData),
      });

      return this.handleResponse<BitApp>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload app' 
      };
    }
  }

  // Get all Bit Apps
  async getAllApps(params?: {
    category?: string;
    search?: string;
    sortBy?: string;
  }): Promise<BitAppAPIResponse<BitApp[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

      // Use /api/v1/dapp endpoint
      const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
      const response = await fetch(`${API_BASE_URL}/api/v1/dapp?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // If backend returns data, use it
      if (response.ok) {
        const result = await this.handleResponse<BitApp[]>(response);
        // If we got valid data from backend, return it
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log('✅ Loaded', result.data.length, 'apps from backend');
          return result;
        }
      }

      // Backend failed or returned empty data - return empty array
      console.log('⚠️ Backend not available or returned empty data');
      return {
        success: true,
        data: []
      };
    } catch (error) {
      // Return error response - backend unavailable
      // Silently handle network errors - backend may be unavailable
      return {
        success: false,
        error: `Failed to fetch apps: ${error instanceof Error ? error.message : String(error)}`,
        data: []
      };
    }
  }

  // Get user's uploaded apps
  async getMyApps(): Promise<BitAppAPIResponse<BitApp[]>> {
    try {
      const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
      const response = await fetch(`${API_BASE_URL}/api/v1/dapp/my-apps`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return await this.handleResponse<BitApp[]>(response);
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch my apps: ${error instanceof Error ? error.message : String(error)}`,
        data: []
      };
    }
  }
}

// Export singleton instance
export const bitAppService = new BitAppService();
export default bitAppService;
