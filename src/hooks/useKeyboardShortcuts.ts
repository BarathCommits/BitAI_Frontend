/**
 * Keyboard Shortcuts Hook
 * 
 * Provides global keyboard shortcuts for navigation.
 * 
 * Shortcuts:
 * - Cmd/Ctrl + Shift + A: Navigate to AI Chat
 * - Cmd/Ctrl + Shift + V: Navigate to Vault
 * - Cmd/Ctrl + Shift + H: Navigate to Home
 * 
 * Used in App.tsx for global keyboard navigation.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Shift + A: Navigate to AI Chat
      if (modKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/chat');
        toast.success('AI Chat opened');
      }

      // Cmd/Ctrl + Shift + V: Navigate to Vault
      if (modKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        navigate('/vault');
        toast.success('Vault opened');
      }

      // Cmd/Ctrl + Shift + D: Navigate to dApp Store (Non-MVP - commented out)
      // if (modKey && e.shiftKey && e.key === 'D') {
      //   e.preventDefault();
      //   navigate('/bit-store');
      //   toast.success('dApp Store opened');
      // }

      // Cmd/Ctrl + Shift + H: Navigate to Home
      if (modKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        navigate('/home');
        toast.success('Home opened');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};

// Export shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  'Open AI Chat': 'Cmd/Ctrl + Shift + A',
  'Open Vault': 'Cmd/Ctrl + Shift + V',
  'Open dApp Store': 'Cmd/Ctrl + Shift + D',
  'Open Home': 'Cmd/Ctrl + Shift + H',
} as const;

