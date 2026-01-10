/**
 * Theme Hook
 * 
 * Manages application theme (light, dark, auto, cyberpunk).
 * 
 * Features:
 * - Theme persistence using Zustand
 * - Auto-switch to cyberpunk when wallet connects
 * - System preference detection (auto mode)
 * - Theme toggle functionality
 * 
 * Used throughout the app for theme management.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto' | 'cyberpunk';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
      },
    }),
    {
      name: 'theme-storage',
      // Only reset to light theme if no theme is stored (first time user)
      onRehydrateStorage: () => (state) => {
        if (state && !state.theme) {
          // Only set to light if no theme preference is stored
          state.theme = 'light';
          applyTheme('light');
        } else if (state) {
          // Apply the stored theme
          applyTheme(state.theme);
        }
      },
    }
  )
);

// Apply theme to document
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove('dark', 'cyberpunk-theme');
  
  if (theme === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else if (theme === 'cyberpunk') {
    root.classList.add('cyberpunk-theme');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

// Hook to use theme with wallet-based switching
export const useTheme = (isWalletConnected?: boolean) => {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  // Auto-switch theme based on wallet connection status
  useEffect(() => {
    if (isWalletConnected !== undefined) {
      if (isWalletConnected && theme !== 'cyberpunk') {
        // Switch to cyberpunk when wallet connects
        setTheme('cyberpunk');
      } else if (!isWalletConnected && theme === 'cyberpunk') {
        // Switch back to light theme when wallet disconnects
        setTheme('light');
      }
    }
  }, [isWalletConnected, theme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);

    // Listen for system theme changes if auto
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isCyberpunk: theme === 'cyberpunk',
  };
};


