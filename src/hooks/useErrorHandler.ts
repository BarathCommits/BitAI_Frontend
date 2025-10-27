import { useCallback } from 'react';
import { errorHandler, ErrorContext, ErrorSeverity, AppError, ERROR_CODES } from '../utils/errorHandler';

export interface UseErrorHandlerReturn {
  handleError: (error: Error | AppError, context?: ErrorContext, severity?: ErrorSeverity) => void;
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    severity?: ErrorSeverity
  ) => Promise<T>;
  createError: (message: string, code: string, statusCode?: number, context?: Record<string, any>) => AppError;
}

export const useErrorHandler = (componentName?: string): UseErrorHandlerReturn => {
  const handleError = useCallback(
    (
      error: Error | AppError,
      context: ErrorContext = {},
      severity: ErrorSeverity = ErrorSeverity.MEDIUM
    ) => {
      const enhancedContext: ErrorContext = {
        ...context,
        component: componentName || context.component,
        timestamp: new Date(),
      };

      errorHandler.handleError(error, enhancedContext, severity);
    },
    [componentName]
  );

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context: ErrorContext = {},
      severity: ErrorSeverity = ErrorSeverity.MEDIUM
    ): Promise<T> => {
      try {
        return await operation();
      } catch (error) {
        const enhancedContext: ErrorContext = {
          ...context,
          component: componentName || context.component,
          timestamp: new Date(),
        };

        errorHandler.handleError(
          error instanceof Error ? error : new Error(String(error)),
          enhancedContext,
          severity
        );
        throw error;
      }
    },
    [componentName]
  );

  const createError = useCallback(
    (
      message: string,
      code: string = ERROR_CODES.UNKNOWN_ERROR,
      statusCode: number = 500,
      context?: Record<string, any>
    ): AppError => {
      return new AppError(message, code, statusCode, context);
    },
    []
  );

  return {
    handleError,
    handleAsyncError,
    createError,
  };
};
