import { errorHandler, ERROR_CODES, ErrorSeverity } from '../utils/errorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  profile: {
    displayName: string;
    bio?: string;
    avatar?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  isEmailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  walletCount: number;
  vaultItems: number;
  connections: number;
  lastActivity: string;
  totalTransactions: number;
  totalValue: string;
  favoriteCategories: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    transaction: boolean;
    security: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analyticsOptIn: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  preferences: {
    defaultChain: number;
    autoConnect: boolean;
    rememberWallets: boolean;
  };
}

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details: {
    resource?: string;
    resourceId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  };
  category: 'authentication' | 'vault' | 'wallet' | 'dapp' | 'settings' | 'security';
}

export interface UserAPIResponse<T> {
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

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<UserAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const errorCode = this.getErrorCode(response.status);
        
        errorHandler.handleError(
          new Error(data.message || 'User operation failed'),
          {
            component: 'UserService',
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
            message: data.message || 'User operation failed',
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
          component: 'UserService',
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

  // User Profile Management
  async getUserProfile(): Promise<UserAPIResponse<UserProfile & { stats: UserStats }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<UserProfile & { stats: UserStats }>(response);
      
      if (result.success && result.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(result.data));
        localStorage.setItem('userStats', JSON.stringify(result.data.stats));
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROFILE_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user profile'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserAPIResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const result = await this.handleResponse<UserProfile>(response);
      
      if (result.success && result.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(result.data));
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROFILE_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update user profile'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // User Settings Management
  async getUserSettings(): Promise<UserAPIResponse<UserSettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/settings`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserSettings>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user settings'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserAPIResponse<UserSettings>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      return this.handleResponse<UserSettings>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update user settings'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // User Activity Management
  async getUserActivity(limit: number = 20, offset: number = 0, category?: string): Promise<UserAPIResponse<UserActivity[]>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${API_BASE_URL}/users/activity?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserActivity[]>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user activity'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // User Statistics
  async getUserStats(): Promise<UserAPIResponse<UserStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<UserStats>(response);
      
      if (result.success && result.data) {
        localStorage.setItem('userStats', JSON.stringify(result.data));
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user statistics'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Avatar Management
  async uploadAvatar(file: File): Promise<UserAPIResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      return this.handleResponse<{ avatarUrl: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AVATAR_UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload avatar'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteAvatar(): Promise<UserAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AVATAR_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete avatar'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Account Management
  async deleteAccount(password: string): Promise<UserAPIResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/account`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete account'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportUserData(): Promise<UserAPIResponse<{ data: any; exportId: string; createdAt: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{ data: any; exportId: string; createdAt: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATA_EXPORT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to export user data'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Notification Management
  async markActivityAsRead(activityId: string): Promise<UserAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/activity/${activityId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_MARK_READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark activity as read'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async markAllActivitiesAsRead(): Promise<UserAPIResponse<{ markedCount: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/activity/read-all`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<{ markedCount: number }>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACTIVITIES_MARK_READ_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark all activities as read'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Real-time Updates (would integrate with WebSocket/SSE)
  subscribeToUserUpdates(callback: (update: { type: string; data: any }) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement polling for user stats updates
    const interval = setInterval(async () => {
      try {
        const result = await this.getUserStats();
        if (result.success && result.data) {
          callback({ type: 'stats_update', data: result.data });
        }
      } catch (error) {
        console.error('Failed to poll user updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const userService = new UserService();
