import { create } from 'zustand';
import { AppNotification, NotificationPreferences, NotificationType } from '../types/notifications';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  lastFetched: Date | null;
  
  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setUnreadCount: (count: number) => void;
  getUnreadNotifications: () => AppNotification[];
  getNotificationsByType: (type: NotificationType) => AppNotification[];
}

// No persistence - all data comes from backend
export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state - no persistence
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetched: null,
  preferences: {
    enabled: true,
    types: {
      transaction: true,
      wallet: true,
      security: true,
      dapp: true,
      ai: true,
      system: true,
      vault: true,
    },
    sound: true,
    desktop: false,
  },

  // Set notifications from backend
  setNotifications: (notifications) => {
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      lastFetched: new Date()
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  addNotification: (notification) => {
    const state = get();
    
    // Check if this notification type is enabled
    if (!state.preferences.enabled || !state.preferences.types[notification.type]) {
      return;
    }

    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to local state immediately for instant UI update
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Play sound if enabled
    if (state.preferences.sound) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606uunVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
    }

    // Desktop notification if enabled
    if (state.preferences.desktop && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
          tag: newNotification.id,
        });
      } catch (e) {
        // Ignore desktop notification errors
      }
    }

    // TODO: Also send to backend API
    // await fetch('http://localhost:3000/api/v1/notifications', { ... })
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    
    // TODO: Also update on backend
    // await fetch(`http://localhost:3000/api/v1/notifications/${id}/read`, { method: 'PUT' })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    
    // TODO: Also update on backend
    // await fetch('http://localhost:3000/api/v1/notifications/read-all', { method: 'PUT' })
  },

  deleteNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
    
    // TODO: Also delete on backend
    // await fetch(`http://localhost:3000/api/v1/notifications/${id}`, { method: 'DELETE' })
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
    
    // TODO: Also clear on backend
    // await fetch('http://localhost:3000/api/v1/notifications', { method: 'DELETE' })
  },

  updatePreferences: (preferences) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...preferences,
        types: preferences.types 
          ? { ...state.preferences.types, ...preferences.types }
          : state.preferences.types,
      },
    }));
    
    // TODO: Also update on backend
    // await fetch('http://localhost:3000/api/v1/notifications/preferences', { method: 'PUT', body: ... })
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read);
  },

  getNotificationsByType: (type) => {
    return get().notifications.filter((n) => n.type === type);
  },
}));

// Helper hook to add notifications easily
export const useAddNotification = () => {
  return useNotificationStore((state) => state.addNotification);
};

// Helper hook to get unread count
export const useUnreadCount = () => {
  return useNotificationStore((state) => state.unreadCount);
};

