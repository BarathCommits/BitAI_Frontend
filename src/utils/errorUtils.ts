/**
 * Utility functions for error handling
 */

/**
 * Converts various error formats to a consistent string format
 * @param error - The error to convert (can be string, Error object, or object with message/code)
 * @param fallbackMessage - Fallback message if error cannot be converted
 * @returns A string representation of the error
 */
export function normalizeError(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // Handle objects with message property
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Handle objects with code and message properties
    if (typeof errorObj.code === 'string' && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Handle API error responses
    if (errorObj.response?.data?.message) {
      return errorObj.response.data.message;
    }
    
    if (errorObj.response?.data?.error) {
      return typeof errorObj.response.data.error === 'string' 
        ? errorObj.response.data.error 
        : errorObj.response.data.error.message || fallbackMessage;
    }
  }
  
  return fallbackMessage;
}

/**
 * Safely extracts error message from API response
 * @param response - API response object
 * @param fallbackMessage - Fallback message if error cannot be extracted
 * @returns A string representation of the error
 */
export function extractApiError(response: any, fallbackMessage: string = 'API request failed'): string {
  if (!response) {
    return fallbackMessage;
  }
  
  // Handle different API error response formats
  if (typeof response.error === 'string') {
    return response.error;
  }
  
  if (response.error && typeof response.error === 'object') {
    return normalizeError(response.error, fallbackMessage);
  }
  
  if (response.message) {
    return response.message;
  }
  
  if (response.data?.message) {
    return response.data.message;
  }
  
  if (response.data?.error) {
    return normalizeError(response.data.error, fallbackMessage);
  }
  
  return fallbackMessage;
}

