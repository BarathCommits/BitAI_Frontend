/**
 * Auth Debugging Utility
 * Helps diagnose authentication issues
 */

export interface TokenPayload {
  id?: string;
  walletAddress?: string;
  chainId?: number;
  role?: string;
  email?: string; // Legacy field
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token without verification (client-side inspection only)
 */
export const decodeJWT = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if the current token is valid for wallet-based authentication
 */
export const isValidWalletToken = (): { valid: boolean; reason?: string; payload?: TokenPayload } => {
  const token = localStorage.getItem('jwtToken');
  
  if (!token) {
    return { valid: false, reason: 'No token found in localStorage' };
  }

  const payload = decodeJWT(token);
  
  if (!payload) {
    return { valid: false, reason: 'Token could not be decoded' };
  }

  // Check if token has walletAddress (required for wallet-based auth)
  if (!payload.walletAddress) {
    return { 
      valid: false, 
      reason: 'Token is missing walletAddress field (likely old email/password token)',
      payload 
    };
  }

  // Check if token is expired
  if (payload.exp) {
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      return { 
        valid: false, 
        reason: `Token expired at ${new Date(payload.exp * 1000).toISOString()}`,
        payload 
      };
    }
  }

  return { valid: true, payload };
};

/**
 * Print comprehensive auth debugging information
 */
export const debugAuth = (): void => {
  console.group('🔍 Auth Debug Information');
  
  const token = localStorage.getItem('jwtToken');
  const walletAddress = localStorage.getItem('walletAddress');
  const user = localStorage.getItem('user');
  
  console.log('📦 LocalStorage Contents:');
  console.log('  - jwtToken:', token ? `${token.substring(0, 30)}...` : 'NOT FOUND');
  console.log('  - walletAddress:', walletAddress || 'NOT FOUND');
  console.log('  - user:', user ? 'EXISTS' : 'NOT FOUND');
  
  if (token) {
    const payload = decodeJWT(token);
    
    console.log('\n🎫 Token Payload:');
    console.log('  - walletAddress:', payload?.walletAddress || '❌ MISSING (This is the problem!)');
    console.log('  - id:', payload?.id || 'not set');
    console.log('  - chainId:', payload?.chainId || 'not set');
    console.log('  - role:', payload?.role || 'not set');
    console.log('  - email (legacy):', payload?.email || 'not set');
    
    if (payload?.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      
      console.log('\n⏰ Token Expiration:');
      console.log('  - Expires at:', expDate.toISOString());
      console.log('  - Current time:', now.toISOString());
      console.log('  - Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
      
      if (!isExpired) {
        const timeLeft = Math.floor((expDate.getTime() - now.getTime()) / 1000 / 60);
        console.log('  - Time left:', `${timeLeft} minutes`);
      }
    }
  }
  
  const validation = isValidWalletToken();
  
  console.log('\n✅ Validation Result:');
  console.log('  - Valid for wallet auth:', validation.valid ? '✅ YES' : '❌ NO');
  if (!validation.valid) {
    console.log('  - Reason:', validation.reason);
  }
  
  if (!validation.valid && validation.reason?.includes('missing walletAddress')) {
    console.log('\n💡 Solution:');
    console.log('  1. Clear old token: localStorage.clear()');
    console.log('  2. Refresh the page');
    console.log('  3. Reconnect your wallet from /auth page');
    console.log('  4. This will generate a new token with walletAddress field');
  }
  
  console.groupEnd();
};

/**
 * Clear all auth data and prepare for fresh wallet connection
 */
export const clearAuthAndReconnect = (): void => {
  console.log('🧹 Clearing all authentication data...');
  
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('user');
  localStorage.removeItem('userStats');
  
  console.log('✅ Auth data cleared. Please reconnect your wallet using the wallet icon in the header.');
  
  // No redirect needed - users can reconnect wallet from any page using header button
};

// Make it available in console for debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuthAndReconnect = clearAuthAndReconnect;
  (window as any).isValidWalletToken = isValidWalletToken;
}

