/**
 * Design Tokens - Google-Level Design System
 * Standardized values for consistent spacing, typography, colors, and more
 */

export const spacing = {
  xs: '4px',   // 0.25rem
  sm: '8px',   // 0.5rem
  md: '16px',  // 1rem
  lg: '24px',  // 1.5rem
  xl: '32px',  // 2rem
  xxl: '48px', // 3rem
};

export const typography = {
  display: { size: '48px', lineHeight: '56px', weight: '700' },
  h1: { size: '32px', lineHeight: '40px', weight: '700' },
  h2: { size: '28px', lineHeight: '36px', weight: '600' },
  h3: { size: '24px', lineHeight: '32px', weight: '600' },
  h4: { size: '20px', lineHeight: '28px', weight: '600' },
  h5: { size: '18px', lineHeight: '24px', weight: '500' },
  body: { size: '16px', lineHeight: '24px', weight: '400' },
  caption: { size: '14px', lineHeight: '20px', weight: '400' },
  label: { size: '12px', lineHeight: '16px', weight: '500' },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export const borderRadius = {
  sm: '6px',  // rounded-md
  md: '8px',  // rounded-lg
  lg: '12px', // rounded-xl
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)',
};

export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

export const iconSizes = {
  sm: '16px',  // w-4 h-4
  md: '20px',  // w-5 h-5
  lg: '24px',  // w-6 h-6
  xl: '32px',  // w-8 h-8
};

// Tailwind class mappings
export const spacingClasses = {
  xs: 'gap-1',     // 4px
  sm: 'gap-2',     // 8px
  md: 'gap-4',     // 16px - Standard form fields
  lg: 'gap-6',     // 24px - Card grids
  xl: 'gap-8',     // 32px - Section spacing
};

export const paddingClasses = {
  xs: 'p-2',       // 8px
  sm: 'p-4',       // 16px
  md: 'p-6',       // 24px - Card content
  lg: 'p-8',       // 32px - Page sections
  xl: 'p-12',      // 48px - Large containers
};

export const typeClasses = {
  display: 'text-5xl font-bold',      // 48px
  h1: 'text-4xl font-bold',           // 32px
  h2: 'text-3xl font-semibold',       // 28px
  h3: 'text-2xl font-semibold',       // 24px
  h4: 'text-xl font-semibold',        // 20px
  h5: 'text-lg font-medium',          // 18px
  body: 'text-base font-normal',      // 16px
  caption: 'text-sm font-normal',     // 14px
  label: 'text-xs font-medium',        // 12px
};
