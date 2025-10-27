// Centralized error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  message: string;
  code: string;
  statusCode: number;
  context: ErrorContext;
  stack?: string;
  timestamp: Date;
}

// Error codes for consistent error handling
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',

  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  WALLET_TRANSACTION_FAILED: 'WALLET_TRANSACTION_FAILED',
  WALLET_INSUFFICIENT_BALANCE: 'WALLET_INSUFFICIENT_BALANCE',
  WALLET_UNSUPPORTED_CHAIN: 'WALLET_UNSUPPORTED_CHAIN',

  // API errors
  API_NETWORK_ERROR: 'API_NETWORK_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  API_VALIDATION_ERROR: 'API_VALIDATION_ERROR',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  API_NOT_FOUND: 'API_NOT_FOUND',

  // UI errors
  UI_COMPONENT_ERROR: 'UI_COMPONENT_ERROR',
  UI_FORM_VALIDATION_ERROR: 'UI_FORM_VALIDATION_ERROR',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorReport[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private handleGlobalError(event: ErrorEvent): void {
    const error = new AppError(
      event.message,
      ERROR_CODES.UI_COMPONENT_ERROR,
      500,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );

    this.handleError(error, {
      component: 'Global',
      action: 'GlobalError',
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new AppError(
          String(event.reason),
          ERROR_CODES.UNKNOWN_ERROR,
          500
        );

    this.handleError(error, {
      component: 'Global',
      action: 'UnhandledRejection',
    });
  }

  public handleError(
    error: Error | AppError,
    context: ErrorContext = {},
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      code: error instanceof AppError ? error.code : ERROR_CODES.UNKNOWN_ERROR,
      statusCode: error instanceof AppError ? error.statusCode : 500,
      context: {
        ...context,
        timestamp: new Date(),
      },
      stack: error.stack,
      timestamp: new Date(),
    };

    // Log error
    this.logError(errorReport, severity);

    // Show user notification for high/critical errors
    if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
      this.notifyUser(errorReport);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorReport);
    }
  }

  private logError(errorReport: ErrorReport, severity: ErrorSeverity): void {
    this.errorLog.push(errorReport);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Console logging based on severity
    const logMethod = this.getLogMethod(severity);
    logMethod(`[${severity.toUpperCase()}] ${errorReport.code}: ${errorReport.message}`, {
      context: errorReport.context,
      stack: errorReport.stack,
    });
  }

  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private notifyUser(errorReport: ErrorReport): void {
    // Use a simple notification method for now
    const message = this.getUserFriendlyMessage(errorReport);
    
    // Try to use toast if available, otherwise use alert
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast.error(message);
    } else {
      // Fallback to console for development
      console.error('User notification:', message);
    }
  }

  private getUserFriendlyMessage(errorReport: ErrorReport): string {
    const userMessages: Record<ErrorCode, string> = {
      [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
      [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
      [ERROR_CODES.AUTH_UNAUTHORIZED]: 'You need to be logged in to access this feature.',
      [ERROR_CODES.AUTH_FORBIDDEN]: 'You don\'t have permission to perform this action.',
      [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
      [ERROR_CODES.WALLET_CONNECTION_FAILED]: 'Failed to connect wallet. Please try again.',
      [ERROR_CODES.WALLET_TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
      [ERROR_CODES.WALLET_INSUFFICIENT_BALANCE]: 'Insufficient balance for this transaction.',
      [ERROR_CODES.WALLET_UNSUPPORTED_CHAIN]: 'This wallet doesn\'t support the current chain.',
      [ERROR_CODES.API_NETWORK_ERROR]: 'Network error. Please check your connection.',
      [ERROR_CODES.API_TIMEOUT]: 'Request timed out. Please try again.',
      [ERROR_CODES.API_VALIDATION_ERROR]: 'Please check your input and try again.',
      [ERROR_CODES.API_SERVER_ERROR]: 'Server error. Please try again later.',
      [ERROR_CODES.API_NOT_FOUND]: 'The requested resource was not found.',
      [ERROR_CODES.UI_COMPONENT_ERROR]: 'Something went wrong. Please refresh the page.',
      [ERROR_CODES.UI_FORM_VALIDATION_ERROR]: 'Please fix the form errors and try again.',
      [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
      [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
    };

    return userMessages[errorReport.code as ErrorCode] || 'An unexpected error occurred.';
  }

  private reportError(errorReport: ErrorReport): void {
    // In production, send to error reporting service (e.g., Sentry, LogRocket)
    // For now, just log to console
    console.error('Error reported to service:', errorReport);
  }

  public getErrorLog(): ErrorReport[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errorLog.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });
    return stats;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility function for creating typed errors
export const createError = (
  message: string,
  code: ErrorCode,
  statusCode: number = 500,
  context?: Record<string, any>
): AppError => {
  return new AppError(message, code, statusCode, context);
};

// Utility function for handling async operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
      severity
    );
    throw error;
  }
};
