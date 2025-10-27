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
    try {
      const response = await originalFetch(...args);

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        console.warn('🔒 401 Unauthorized - Token expired or invalid');
        
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/vault', '/developer', '/settings'];
        const publicRoutes = ['/', '/home', '/auth', '/chat'];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
        const isPublicRoute = publicRoutes.includes(currentPath);
        
        // Clear all authentication data
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('userStats');
        
        // Only show session expired message for protected routes (with debounce)
        if (isProtectedRoute) {
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

      return response;
    } catch (error) {
      // Network errors or other fetch failures
      console.error('Fetch error:', error);
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

