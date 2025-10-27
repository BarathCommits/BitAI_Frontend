import React, { Component, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorHandler } from '../../utils/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Report error to error handler
    errorHandler.handleError(error, {
      component: 'ErrorBoundary',
      action: 'ComponentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback 
        error={this.state.error} 
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        onReload={this.handleReload}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  onReload?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoHome,
  onReload,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4">
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try one of the options below.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <div className="bg-gray-100 p-3 rounded-md text-xs font-mono text-gray-800 overflow-auto max-h-32">
                <div className="font-semibold mb-1">{error.name}: {error.message}</div>
                {error.stack && (
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          )}

          <div className="space-y-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            )}
            
            <div className="flex space-x-3">
              {onGoHome && (
                <Button
                  variant="outline"
                  onClick={onGoHome}
                  className="flex-1"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              )}
              
              {onReload && (
                <Button
                  variant="outline"
                  onClick={onReload}
                  className="flex-1"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Reload Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
