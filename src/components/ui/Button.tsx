/**
 * Button Component
 * 
 * Reusable button component with:
 * - Multiple variants (primary, secondary, outline, ghost, destructive)
 * - Size options (sm, md, lg)
 * - Loading state with spinner
 * - Left/right icon support
 * - Full width option
 * - Theme-aware styling (cyberpunk/modern based on wallet connection)
 * 
 * This is a core UI component used throughout the application.
 */
import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { connectedWallets } = useBuiltInWallet();
    const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
    
    const baseClasses = 'btn';
    
    const variantClasses = {
      primary: theme === 'cyberpunk' 
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-blue-400/50 hover:from-blue-400 hover:to-purple-400 hover:border-blue-300 shadow-lg shadow-blue-500/25 transition-all duration-300' 
        : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 focus:ring-primary-500 shadow-glow',
      secondary: theme === 'cyberpunk' 
        ? 'bg-green-500/20 border border-green-400/50 text-green-400 hover:bg-green-500/30 hover:text-green-300 hover:border-green-300 transition-all duration-300' 
        : 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-900 hover:from-secondary-200 hover:to-secondary-300 focus:ring-secondary-500',
      outline: theme === 'cyberpunk' 
        ? 'border border-green-400/50 text-green-400 bg-transparent hover:bg-green-500/20 hover:text-green-300 hover:border-green-300 transition-all duration-300' 
        : 'border border-primary-300 bg-transparent text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 focus:ring-primary-500',
      ghost: theme === 'cyberpunk' 
        ? 'text-white/80 hover:text-white hover:bg-green-500/20 transition-all duration-300' 
        : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:text-primary-900 focus:ring-primary-500',
      destructive: theme === 'cyberpunk' 
        ? 'bg-red-500/20 border border-red-400/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 hover:border-red-300 transition-all duration-300' 
        : 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 focus:ring-error-500',
    };
    
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          {
            'opacity-50 cursor-not-allowed': disabled || loading,
            'cursor-wait': loading,
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
