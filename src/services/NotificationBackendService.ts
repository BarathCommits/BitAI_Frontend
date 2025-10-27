/**
 * Notification Backend Service
 * Handles all backend API calls for notifications
 * NO localStorage - everything syncs with backend
 */

import { AppNotification, NotificationPreferences } from '../types/notifications';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

interface NotificationResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

class NotificationBackendService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Fetch notifications from backend
   */
  async getNotifications(options?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.skip) params.append('skip', options.skip.toString());
      if (options?.unreadOnly) params.append('unreadOnly', 'true');
      if (options?.type) params.append('type', options.type);

      const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch notifications'
        }
      };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data.success ? data.data.count : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to mark notification as read'
        }
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to mark all as read'
        }
      };
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete notification'
        }
      };
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to clear notifications'
        }
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update preferences'
        }
      };
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch preferences'
        }
      };
    }
  }

  /**
   * Create a new notification (called by backend when events happen)
   * Frontend can also create local notifications for immediate feedback
   */
  async createNotification(notification: {
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: any;
  }): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notification),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create notification'
        }
      };
    }
  }
}

export const notificationBackendService = new NotificationBackendService();

