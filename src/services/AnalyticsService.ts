/**
 * Analytics Service
 * 
 * Tracks user events and activities for analytics.
 * 
 * Features:
 * - Event tracking (page views, clicks, interactions)
 * - User activity tracking (login, wallet connect, AI chat, vault operations)
 * - Session tracking
 * - Transaction tracking
 * - Silently fails if user not authenticated (doesn't break UX)
 * 
 * Used throughout the app for analytics and user behavior tracking.
 * 
 * Note: Analytics is important for understanding user behavior and improving the product.
 * It's actively used in ChatPage, UnifiedWalletService, and other components.
 */
import { API_CONFIG } from '../config/api';
import { authService } from './AuthService';
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface AnalyticsEvent {
  eventType: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface UserActivity {
  activityType: 
    | 'login' 
    | 'logout' 
    | 'wallet_connect' 
    | 'wallet_disconnect'
    | 'dapp_interaction'
    | 'transaction'
    | 'ai_chat'
    | 'vault_access'
    | 'vault_create'
    | 'vault_update'
    | 'vault_delete'
    | 'session_create'
    | 'session_switch'
    | 'page_view'
    | 'settings_update'
    | 'profile_update';
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Track a general analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<boolean> {
    // Skip tracking if user is not authenticated
    const isAuth = authService.isAuthenticated();
    if (!isAuth) {
      // Silently skip - user not authenticated
      return false;
    }

    try {
      const user = authService.getUser();
      const userId = user?.id;
      const walletAddress = authService.getWalletAddress();

      const payload = {
        eventType: event.eventType,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        userId: userId || undefined,
        walletAddress: walletAddress || undefined,
        metadata: {
          ...event.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          path: window.location.pathname,
        },
      };

      const response = await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Silently handle 401 (unauthorized) and 400 (bad request) - expected for unauthenticated users
        if (response.status === 401 || response.status === 400) {
          return false;
        }
        // Only log unexpected errors
        logger.warn('Analytics tracking failed:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      // Silently fail analytics - don't break user experience
      return false;
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(activity: UserActivity): Promise<boolean> {
    // Skip tracking if user is not authenticated
    const isAuth = authService.isAuthenticated();
    if (!isAuth) {
      // Silently skip - user not authenticated
      return false;
    }

    try {
      const user = authService.getUser();
      const userId = user?.id || user?.walletAddress;
      
      // If no user ID available, skip tracking
      if (!userId) {
        return false;
      }
      const walletAddress = authService.getWalletAddress();

      const payload = {
        activityType: activity.activityType,
        userId: userId || undefined,
        walletAddress: walletAddress || undefined,
        details: activity.details || {},
        metadata: {
          ...activity.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          path: window.location.pathname,
        },
      };

      const response = await fetch(`${API_BASE_URL}/analytics/activity`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Silently handle 401 (unauthorized) and 400 (bad request) - expected for unauthenticated users
        if (response.status === 401 || response.status === 400) {
          return false;
        }
        // Only log unexpected errors
        logger.warn('Activity tracking failed:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      // Silently fail analytics - don't break user experience
      return false;
    }
  }

  // Convenience methods for common events
  trackPageView(page: string, metadata?: Record<string, any>) {
    this.trackEvent({
      eventType: 'page_view',
      category: 'navigation',
      action: 'view',
      label: page,
      metadata,
    });
  }

  trackClick(element: string, metadata?: Record<string, any>) {
    this.trackEvent({
      eventType: 'click',
      category: 'interaction',
      action: 'click',
      label: element,
      metadata,
    });
  }

  trackLogin(method: string = 'wallet') {
    this.trackActivity({
      activityType: 'login',
      details: { method },
    });
  }

  trackLogout() {
    this.trackActivity({
      activityType: 'logout',
    });
  }

  trackWalletConnect(walletAddress: string, walletType: string, chainId?: number) {
    this.trackActivity({
      activityType: 'wallet_connect',
      details: {
        walletAddress,
        walletType,
        chainId,
      },
    });
  }

  trackWalletDisconnect(walletAddress: string) {
    this.trackActivity({
      activityType: 'wallet_disconnect',
      details: { walletAddress },
    });
  }

  trackAIChat(messageLength: number, sessionId?: string, provider?: string) {
    this.trackActivity({
      activityType: 'ai_chat',
      details: {
        messageLength,
        sessionId,
        provider,
      },
    });
  }

  trackDAppInteraction(dappId: string, action: string, metadata?: Record<string, any>) {
    this.trackActivity({
      activityType: 'dapp_interaction',
      details: {
        dappId,
        action,
        ...metadata,
      },
    });
  }

  trackTransaction(txHash: string, chainId: number, type: string, metadata?: Record<string, any>) {
    this.trackActivity({
      activityType: 'transaction',
      details: {
        txHash,
        chainId,
        type,
        ...metadata,
      },
    });
  }

  trackVaultAccess(action: 'create' | 'read' | 'update' | 'delete', itemId?: string) {
    this.trackActivity({
      activityType: action === 'create' ? 'vault_create' :
                   action === 'read' ? 'vault_access' :
                   action === 'update' ? 'vault_update' :
                   'vault_delete',
      details: { itemId },
    });
  }

  trackSessionCreate(sessionId: string) {
    this.trackActivity({
      activityType: 'session_create',
      details: { sessionId },
    });
  }

  trackSessionSwitch(sessionId: string) {
    this.trackActivity({
      activityType: 'session_switch',
      details: { sessionId },
    });
  }

  trackSettingsUpdate(setting: string, value: any) {
    this.trackActivity({
      activityType: 'settings_update',
      details: { setting, value },
    });
  }

  trackProfileUpdate(field: string) {
    this.trackActivity({
      activityType: 'profile_update',
      details: { field },
    });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

