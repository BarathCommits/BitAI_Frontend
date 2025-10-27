import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // State
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      theme: 'auto',
      sidebarCollapsed: false,
      notifications: [],
      
      // Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        set({ theme });
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },
      
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'app-storage',
      // Only persist user preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useAppState = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  theme: state.theme,
  sidebarCollapsed: state.sidebarCollapsed,
}));

export const useAppActions = () => useAppStore((state) => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

