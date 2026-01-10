/**
 * Notifications Hook
 * 
 * Fetches notifications from backend (NO localStorage).
 * Syncs with backend API for all operations.
 * 
 * Features:
 * - Fetch notifications from backend
 * - Mark as read/unread
 * - Delete notifications
 * - Auto-polling every 30 seconds
 * - Unread count tracking
 * 
 * Used in Header and NotificationPanel components.
 */
import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { notificationBackendService } from '../services/NotificationBackendService';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

export const useNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    setNotifications,
    setLoading,
    setUnreadCount,
    markAsRead: markAsReadLocal,
    markAllAsRead: markAllAsReadLocal,
    deleteNotification: deleteNotificationLocal,
    clearAll: clearAllLocal,
  } = useNotificationStore();

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    // Check both auth store and localStorage token
    const token = localStorage.getItem('jwtToken');
    if (!isAuthenticated || !token) {
      logger.debug('⏭️ Notifications: Skipping fetch - user not authenticated');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationBackendService.getNotifications({
        limit: 100
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        if (response.data.pagination?.unreadCount !== undefined) {
          setUnreadCount(response.data.pagination.unreadCount);
        }
      } else if (response.error?.code === 'INVALID_TOKEN') {
        logger.warn('🔒 Notifications: Invalid token, clearing auth state');
        // Token is invalid, clear auth state
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setNotifications, setLoading, setUnreadCount]);

  /**
   * Fetch unread count only (lighter request)
   */
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('jwtToken');
    if (!isAuthenticated || !token) {
      logger.debug('⏭️ Notifications: Skipping unread count - user not authenticated');
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationBackendService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      logger.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated, setUnreadCount]);

  /**
   * Mark notification as read (sync with backend)
   */
  const markAsRead = useCallback(async (id: string) => {
    // Update local state immediately for instant UI feedback
    markAsReadLocal(id);
    
    // Sync with backend
    try {
      await notificationBackendService.markAsRead(id);
    } catch (error) {
      logger.error('Failed to sync mark as read with backend:', error);
      // Could revert local state here if needed
    }
  }, [markAsReadLocal]);

  /**
   * Mark all as read (sync with backend)
   */
  const markAllAsRead = useCallback(async () => {
    // Update local state immediately
    markAllAsReadLocal();
    
    // Sync with backend
    try {
      await notificationBackendService.markAllAsRead();
    } catch (error) {
      logger.error('Failed to sync mark all as read with backend:', error);
    }
  }, [markAllAsReadLocal]);

  /**
   * Delete notification (sync with backend)
   */
  const deleteNotification = useCallback(async (id: string) => {
    // Update local state immediately
    deleteNotificationLocal(id);
    
    // Sync with backend
    try {
      await notificationBackendService.deleteNotification(id);
    } catch (error) {
      logger.error('Failed to sync delete with backend:', error);
    }
  }, [deleteNotificationLocal]);

  /**
   * Clear all notifications (sync with backend)
   */
  const clearAll = useCallback(async () => {
    // Update local state immediately
    clearAllLocal();
    
    // Sync with backend
    try {
      await notificationBackendService.clearAll();
    } catch (error) {
      logger.error('Failed to sync clear all with backend:', error);
    }
  }, [clearAllLocal]);

  /**
   * Auto-fetch on mount and set up polling
   */
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount(); // Lighter request for polling
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};

