import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setAuth: (token: string, user: User) => void; // Wallet auth method
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  getUserId: () => string | null;
  getUserEmail: () => string | null;
  getWalletAddress: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      // Actions
      login: (user: User, token: string) => {
        set({
          isAuthenticated: true,
          user,
          token,
          error: null,
        });
      },
      
      // Wallet-based authentication method (primary auth method)
      setAuth: (token: string, user: User) => {
        set({
          isAuthenticated: true,
          user,
          token,
          error: null,
        });
        
        // Also update localStorage for consistency with AuthService
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('walletAddress', user.walletAddress);
      },
      
      logout: () => {
        // Clear Zustand state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
        
        // Clear localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('userStats');

        // Dispatch wallet disconnected event for vault cleanup
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      setToken: (token: string | null) => {
        set({ token });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Computed getters
      getUserId: () => {
        const state = get();
        return state.user?.id || null;
      },
      
      getUserEmail: () => {
        const state = get();
        return state.user?.email || null;
      },
      
      getWalletAddress: () => {
        const state = get();
        return state.user?.walletAddress || null;
      },
    }),
    {
      name: 'auth-storage',
      // Only persist essential auth data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useAuth = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  token: state.token,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  setToken: state.setToken,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}));

export const useAuthLoading = () => useAuthStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
}));
