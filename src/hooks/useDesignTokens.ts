import { useMemo } from 'react';
import {
  spacing,
  typography,
  breakpoints,
  borderRadius,
  shadows,
  transitions,
  iconSizes,
  spacingClasses,
  paddingClasses,
  typeClasses,
} from '../design/tokens';

/**
 * Hook to access design tokens
 * Provides consistent design values throughout the application
 */
export const useDesignTokens = () => {
  return useMemo(() => ({
    spacing,
    typography,
    breakpoints,
    borderRadius,
    shadows,
    transitions,
    iconSizes,
    // CSS Class shortcuts
    spacingClasses,
    paddingClasses,
    typeClasses,
  }), []);
};

export default useDesignTokens;
