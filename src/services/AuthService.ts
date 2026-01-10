import { errorHandler, ERROR_CODES, ErrorSeverity } from '../utils/errorHandler';
import { API_CONFIG, getAuthHeaders } from '../config/api';
import { STORAGE_KEYS } from '../constants/storage';
import { authLogger as logger } from '../utils/logger';
import { analyticsService } from './AnalyticsService';

// Get API base URL from environment or default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Legacy interface - kept for backward compatibility but not used in wallet-only auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  walletAddress: string; // Primary identifier - wallet address
  chainId?: number;
  email?: string; // Optional
  username?: string; // Optional display name
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
  walletProvider?: string; // MetaMask, Phantom, etc.
  isEmailVerified?: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface UserStats {
  walletCount: number;
  vaultItems: number;
  connections: number;
  lastActivity: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  stats: UserStats;
}

export interface AuthAPIResponse<T> {
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
}

class AuthService {
  // Rate limiting for nonce requests
  private nonceRequestTimestamps: Map<string, number> = new Map();
  private readonly NONCE_RATE_LIMIT_MS = 1000; // 1 second between requests per address

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return getAuthHeaders(token || undefined);
  }

  private async handleResponse<T>(response: Response): Promise<AuthAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const errorCode = this.getErrorCode(response.status);
        const userFriendlyMessage = this.getUserFriendlyMessage(data, response.status);
        
        errorHandler.handleError(
          new Error(data.message || 'Authentication failed'),
          {
            component: 'AuthService',
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
            message: userFriendlyMessage,
            details: data.details || []
          },
          timestamp: new Date().toISOString()
        };
      }
      
      return { 
        success: true, 
        data: data.data || data,
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to parse response'),
        {
          component: 'AuthService',
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
        return ERROR_CODES.API_VALIDATION_ERROR;
      case 500:
        return ERROR_CODES.API_SERVER_ERROR;
      default:
        return ERROR_CODES.API_NETWORK_ERROR;
    }
  }

  private getUserFriendlyMessage(data: any, status: number): string {
    // Handle specific backend error codes
    if (data.error?.code) {
      switch (data.error.code) {
        case 'USER_EXISTS':
          return 'An account with this email or username already exists. Please try logging in instead or use different credentials.';
        case 'VALIDATION_ERROR':
          if (data.error.details && Array.isArray(data.error.details)) {
            const validationErrors = data.error.details.map((detail: any) => detail.msg).join(', ');
            return `Please check your input: ${validationErrors}`;
          }
          return 'Please check your input and try again.';
        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'REGISTRATION_ERROR':
          return 'Registration failed. Please try again or contact support if the problem persists.';
        case 'LOGIN_ERROR':
          return 'Login failed. Please try again or contact support if the problem persists.';
        case 'AUTH_TOKEN_EXPIRED':
          return 'Your session has expired. Please log in again.';
        case 'AUTH_TOKEN_INVALID':
          return 'Invalid session. Please log in again.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many attempts. Please wait a few minutes before trying again.';
        case 'ACCOUNT_LOCKED':
          return 'Your account has been temporarily locked. Please contact support.';
        case 'EMAIL_NOT_VERIFIED':
          return 'Please verify your email address before logging in.';
        case 'WEAK_PASSWORD':
          return 'Password is too weak. Please use a stronger password with at least 8 characters.';
        case 'INVALID_EMAIL':
          return 'Please enter a valid email address.';
        case 'USERNAME_TAKEN':
          return 'This username is already taken. Please choose a different one.';
        case 'EMAIL_TAKEN':
          return 'This email is already registered. Please try logging in instead.';
        case 'FORGOT_PASSWORD_ERROR':
          return 'Failed to send password reset email. Please try again or contact support.';
        case 'RESET_PASSWORD_ERROR':
          return 'Failed to reset password. Please try again or contact support.';
        case 'INVALID_RESET_TOKEN':
          return 'Invalid or expired reset token. Please request a new password reset.';
        case 'VERIFY_TOKEN_ERROR':
          return 'Failed to verify reset token. Please try again.';
        default:
          return data.error.message || 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle HTTP status codes
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'Server error. Please try again later or contact support.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service is currently unavailable. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * @deprecated Email/password login is deprecated. Use walletLogin() instead.
   * Wallet-based authentication is the primary auth method.
   */
  async login(credentials: LoginCredentials): Promise<AuthAPIResponse<AuthResponse>> {
    logger.warn('⚠️ Email/password login is deprecated. Please use wallet authentication.');
    return {
      success: false,
      error: {
        code: 'AUTH_METHOD_DEPRECATED',
        message: 'Email/password authentication is no longer supported. Please connect your wallet to sign in.'
      },
      timestamp: new Date().toISOString()
    };
  }

  // Logout and clear stored token
  async logout(): Promise<AuthAPIResponse<void>> {
    try {
      // Track logout activity
      analyticsService.trackLogout();

      const response = await fetch(API_CONFIG.AUTH.LOGOUT, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      // Clear local storage regardless of API response
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.USER_STATS);

      return this.handleResponse<void>(response);
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.USER_STATS);

      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Logout failed'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get stored JWT token
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  }

  // Get stored user info
  getUser(): UserProfile | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get stored user stats
  getUserStats(): UserStats | null {
    const statsStr = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return statsStr ? JSON.parse(statsStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Basic token validation (check if it's not expired)
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

  // Refresh token (if backend supports it)
  async refreshToken(): Promise<AuthAPIResponse<{ token: string }>> {
    try {
      const response = await fetch(API_CONFIG.AUTH.REFRESH, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      const result = await this.handleResponse<{ token: string }>(response);
      
      if (result.success && result.data?.token) {
        localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, result.data.token);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: error instanceof Error ? error.message : 'Token refresh failed'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * @deprecated Email/password registration is deprecated. Wallet connection auto-registers users.
   * Users are automatically registered when they connect their wallet for the first time.
   */
  async register(userData: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }): Promise<AuthAPIResponse<AuthResponse>> {
    logger.warn('⚠️ Email/password registration is deprecated. Users are auto-registered via wallet connection.');
    return {
      success: false,
      error: {
        code: 'AUTH_METHOD_DEPRECATED',
        message: 'Email/password registration is no longer supported. Please connect your wallet to get started.'
      },
      timestamp: new Date().toISOString()
    };
  }

  // User Profile Management
  async getUserProfile(): Promise<AuthAPIResponse<UserProfile & { stats: UserStats }>> {
    try {
      const response = await fetch(API_CONFIG.USERS.PROFILE, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<UserProfile & { stats: UserStats }>(response);
      
      if (result.success && result.data) {
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
        localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(result.data.stats));
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

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<AuthAPIResponse<UserProfile>> {
    try {
      const response = await fetch(API_CONFIG.USERS.PROFILE, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const result = await this.handleResponse<UserProfile>(response);
      
      if (result.success && result.data) {
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
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
  async getUserSettings(): Promise<AuthAPIResponse<UserSettings>> {
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

  async updateUserSettings(settings: Partial<UserSettings>): Promise<AuthAPIResponse<UserSettings>> {
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

  // User Activity
  async getUserActivity(limit: number = 10, offset: number = 0): Promise<AuthAPIResponse<Array<{
    id: string;
    action: string;
    timestamp: string;
    details: any;
  }>>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`${API_BASE_URL}/users/activity?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<Array<{
        id: string;
        action: string;
        timestamp: string;
        details: any;
      }>>(response);
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

  // Wallet Authentication Methods
  async walletLogin(walletData: {
    walletAddress: string;
    authMessage: string;
    signature: string;
    nonce: string;
    walletType: string;
    chainId: number;
  }): Promise<AuthAPIResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wallet/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });
      
      const result = await this.handleResponse<AuthResponse>(response);
      
      if (result.success && result.data) {
        const { user, token } = result.data;
        
        // Store token and user in localStorage
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('walletAddress', walletData.walletAddress);
        
        // Track login activity
        analyticsService.trackLogin('wallet');
        
        // Debug logging
        logger.debug('AuthService: Wallet login successful');
        logger.debug('AuthService: Wallet address:', walletData.walletAddress);
        logger.debug('AuthService: User stored:', user);
      }
      
      return result;
    } catch (error) {
      let errorMessage = 'Wallet authentication failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = `Wallet authentication failed: ${error.message}`;
        }
      }
      
      return { 
        success: false, 
        error: {
          code: 'WALLET_AUTH_ERROR',
          message: errorMessage
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getWalletNonce(address: string, walletType: string = 'ethereum', chainId: number = 1): Promise<AuthAPIResponse<{ nonce: string; authMessage: string; expiresAt: string; chainId: number; walletType: string; message: string }>> {
    try {
      // Check rate limiting
      const now = Date.now();
      const lastRequestTime = this.nonceRequestTimestamps.get(address);
      
      if (lastRequestTime && (now - lastRequestTime) < this.NONCE_RATE_LIMIT_MS) {
        const waitTime = Math.ceil((this.NONCE_RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
        logger.debug(`⏳ Rate limiting: Please wait ${waitTime} second(s) before requesting another nonce`);
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Please wait ${waitTime} second(s) before trying to connect again.`
          },
          timestamp: new Date().toISOString()
        };
      }

      // Update timestamp
      this.nonceRequestTimestamps.set(address, now);

      const response = await fetch(`${API_BASE_URL}/auth/wallet/nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          walletAddress: address,
          walletType: walletType,
          chainId: chainId
        }),
      });
      
      return this.handleResponse<{ nonce: string; authMessage: string; expiresAt: string; chainId: number; walletType: string; message: string }>(response);
    } catch (error) {
      return { 
        success: false, 
        error: {
          code: 'NONCE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get nonce'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get connected wallet address
  getWalletAddress(): string | null {
    return localStorage.getItem('walletAddress');
  }

  /**
   * @deprecated Password reset is not available for wallet-based authentication.
   * Users control their accounts through their wallet's private keys.
   */
  async forgotPassword(email: string): Promise<AuthAPIResponse<{ message: string; resetLink?: string }>> {
    logger.warn('⚠️ Password reset not available for wallet-based authentication.');
    return {
      success: false,
      error: {
        code: 'AUTH_METHOD_DEPRECATED',
        message: 'Password reset is not available. Your wallet private key is your password.'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * @deprecated Password reset is not available for wallet-based authentication.
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<AuthAPIResponse<{ message: string }>> {
    logger.warn('⚠️ Password reset not available for wallet-based authentication.');
    return {
      success: false,
      error: {
        code: 'AUTH_METHOD_DEPRECATED',
        message: 'Password reset is not available. Your wallet private key is your password.'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * @deprecated Token verification not available for wallet-based authentication.
   */
  async verifyResetToken(token: string): Promise<AuthAPIResponse<{ email: string; username: string }>> {
    logger.warn('⚠️ Token verification not available for wallet-based authentication.');
    return {
      success: false,
      error: {
        code: 'AUTH_METHOD_DEPRECATED',
        message: 'Token verification is not available for wallet-based authentication.'
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const authService = new AuthService();
