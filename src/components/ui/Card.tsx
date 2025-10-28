import React from 'react';
import { cn } from '../../utils/cn';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const { connectedWallets } = useBuiltInWallet();
    const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
    
    const baseClasses = 'card rounded-lg border';
    
    const variantClasses = {
      default: theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/30' 
        : 'bg-white border-secondary-200 shadow-sm',
      elevated: theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/50' 
        : 'bg-white border-secondary-200 shadow-lg',
      flat: theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/50' 
        : 'bg-white border-2 border-secondary-200 shadow-none',
      outlined: theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/50' 
        : 'bg-white border-2 border-primary-200 shadow-sm',
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-300' : 'transition-all duration-300';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-header flex items-center justify-between p-6 pb-4', className)}
        {...props}
      >
        <div className="flex-1 gap-2 flex flex-col">
          {title && (
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-secondary-600">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-content px-6 py-4', className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card-footer px-6 py-4 pt-4', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
