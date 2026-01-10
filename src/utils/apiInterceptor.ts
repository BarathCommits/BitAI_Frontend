import toast from 'react-hot-toast';

/**
 * Setup global fetch interceptor to handle authentication errors
 * This ensures that any 401 response automatically logs out the user
 * and redirects them to the wallet connect page
 */
export const setupAuthInterceptor = () => {
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Debounce mechanism to prevent duplicate session expired messages
  let lastSessionExpiredToast = 0;
  const SESSION_EXPIRED_DEBOUNCE_MS = 5000; // 5 seconds

  // Override global fetch
  window.fetch = async (...args): Promise<Response> => {
    // Extract URL before making the request to check if it's an analytics endpoint
    let url = '';
    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] instanceof Request) {
      url = args[0].url;
    } else if (args[0]?.url) {
      url = args[0].url;
    }
    const urlLower = url.toLowerCase();
    const isAnalyticsEndpoint = urlLower.includes('/analytics/');

    try {
      const response = await originalFetch(...args);

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Check if user has a token - if not, this is expected (user not authenticated)
        const hasToken = localStorage.getItem('jwtToken');
        
        const isAIEndpoint = urlLower.includes('/ai/');
        const isFeedbackEndpoint = urlLower.includes('/feedback');
        
        // Skip logging for analytics, AI, and feedback endpoints (expected for unauthenticated users)
        // Only log warning if user had a token (unexpected 401) and it's not an analytics/AI/feedback endpoint
        if (hasToken && !isAnalyticsEndpoint && !isAIEndpoint && !isFeedbackEndpoint) {
          console.warn('🔒 401 Unauthorized - Token expired or invalid');
        }
        // Otherwise, silently handle - user is not authenticated (expected behavior)
        
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/vault', '/developer', '/settings'];
        const publicRoutes = ['/', '/home', '/auth', '/chat'];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
        const isPublicRoute = publicRoutes.includes(currentPath);
        
        // For analytics, AI, and feedback endpoints, don't clear auth data on 401 - it's expected
        if (!isAnalyticsEndpoint && !isAIEndpoint && !isFeedbackEndpoint) {
          // Clear all authentication data
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('userStats');
        }
        
        // Only show session expired message for protected routes (with debounce)
        // Skip for analytics, AI, and feedback endpoints to avoid unnecessary toasts
        if (isProtectedRoute && hasToken && !isAnalyticsEndpoint && !isAIEndpoint && !isFeedbackEndpoint) {
          const now = Date.now();
          if (now - lastSessionExpiredToast > SESSION_EXPIRED_DEBOUNCE_MS) {
            lastSessionExpiredToast = now;
            toast.error('Session expired. Please reconnect your wallet using the wallet icon in the header.', {
              duration: 5000,
              icon: '🔐',
            });
          }
        }
        
        // No redirect needed - users can reconnect wallet from any page using header button
      }

      // Handle 400 Bad Request for analytics, feedback, and AI endpoints silently
      const isFeedbackEndpoint = urlLower.includes('/feedback');
      const isAIEndpoint = urlLower.includes('/ai/');
      if (response.status === 400 && (isAnalyticsEndpoint || isFeedbackEndpoint || isAIEndpoint)) {
        // Silently handle - expected for unauthenticated users or validation errors
        // Don't log to console to avoid clutter
        return response;
      }

      // Handle 500 Internal Server Error and 502 Bad Gateway for AI endpoints - suppress console noise
      // Frontend already handles these gracefully with user-friendly messages
      if ((response.status === 500 || response.status === 502) && isAIEndpoint) {
        // Don't log to console - frontend handles this gracefully
        // Return response so calling code can handle it
        return response;
      }

      return response;
    } catch (error) {
      // Network errors or other fetch failures
      // Suppress console errors for analytics, AI, dApp, and feedback endpoints to avoid console clutter
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : args[0]?.url || '';
      const urlLower = url.toLowerCase();
      const isAnalyticsEndpoint = urlLower.includes('/analytics/');
      const isAIEndpoint = urlLower.includes('/ai/');
      const isDAppEndpoint = urlLower.includes('/dapp') || urlLower.includes('/d-app');
      const isFeedbackEndpoint = urlLower.includes('/feedback');
      
      // Only log errors for endpoints that are not analytics, AI, dApp, or feedback
      if (!isAnalyticsEndpoint && !isAIEndpoint && !isDAppEndpoint && !isFeedbackEndpoint) {
        console.error('Fetch error:', error);
      }
      // Always throw to allow error handling in calling code
      throw error;
    }
  };

  console.log('✅ Auth interceptor initialized');
};

/**
 * Check if the current JWT token is expired
 * Returns true if token is expired or invalid
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Date.now() / 1000;
    
    return payload.exp ? payload.exp < currentTime : true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Validate current session on page load
 * Clears auth data if token is expired
 */
export const validateSession = (): boolean => {
  const token = localStorage.getItem('jwtToken');
  
  if (isTokenExpired(token)) {
    console.warn('🔒 Session expired - clearing auth data');
    
    // Clear expired session
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userStats');
    
    return false;
  }
  
  return true;
};

