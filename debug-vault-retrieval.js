/**
 * Debug script to test vault data retrieval
 * Run this in the browser console to debug vault data issues
 */

async function debugVaultRetrieval() {
  console.log('🔍 Debugging Vault Data Retrieval...');
  
  // Check current auth status
  const token = localStorage.getItem('jwtToken');
  const walletAddress = localStorage.getItem('walletAddress');
  const user = localStorage.getItem('user');
  
  console.log('📋 Current Authentication Status:');
  console.log('  - JWT Token:', token ? `${token.substring(0, 30)}...` : 'Missing');
  console.log('  - Wallet Address:', walletAddress || 'Missing');
  console.log('  - User Data:', user ? JSON.parse(user) : 'Missing');
  
  if (!token || !walletAddress) {
    console.log('❌ No authentication found. Please connect a wallet first.');
    return;
  }
  
  // Test vault API directly
  console.log('\n📋 Testing Vault API Directly:');
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  
  try {
    console.log('📥 Making GET request to /vault/info...');
    const response = await fetch(`${API_BASE_URL}/vault/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📥 Response Data:', data);
    
    if (data.success && Array.isArray(data.data)) {
      console.log(`✅ SUCCESS: Retrieved ${data.data.length} vault items`);
      data.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.label} (${item.type})`);
      });
    } else {
      console.log('❌ FAILURE: Could not retrieve vault data');
      console.log('Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
  
  // Check if vault data is in localStorage
  console.log('\n📋 Checking localStorage for vault data:');
  const vaultData = localStorage.getItem('vaultData');
  const personalInfo = localStorage.getItem('personalInfo');
  
  console.log('  - vaultData:', vaultData ? JSON.parse(vaultData) : 'Not found');
  console.log('  - personalInfo:', personalInfo ? JSON.parse(personalInfo) : 'Not found');
  
  // Test wallet store state
  console.log('\n📋 Checking Wallet Store State:');
  // This will only work if the wallet store is accessible
  try {
    // Try to access the wallet store through the window object if it exists
    if (window.__SAFEBROWSER_WALLET_STORE__) {
      const walletState = window.__SAFEBROWSER_WALLET_STORE__.getState();
      console.log('  - Wallet Store State:', walletState);
    } else {
      console.log('  - Wallet Store not accessible via window object');
    }
  } catch (error) {
    console.log('  - Could not access wallet store:', error.message);
  }
  
  console.log('\n✅ Debug completed!');
}

// Additional debugging functions
function simulateWalletConnection() {
  console.log('🔄 Simulating wallet connection event...');
  window.dispatchEvent(new CustomEvent('walletConnected', { 
    detail: { address: localStorage.getItem('walletAddress') } 
  }));
  console.log('✅ Wallet connection event dispatched');
}

function simulateWalletDisconnection() {
  console.log('🔄 Simulating wallet disconnection event...');
  window.dispatchEvent(new CustomEvent('walletDisconnected', { 
    detail: { address: localStorage.getItem('walletAddress') } 
  }));
  console.log('✅ Wallet disconnection event dispatched');
}

function clearVaultCache() {
  console.log('🧹 Clearing vault cache...');
  localStorage.removeItem('vaultData');
  localStorage.removeItem('personalInfo');
  console.log('✅ Vault cache cleared');
}

// Export functions
window.debugVaultRetrieval = debugVaultRetrieval;
window.simulateWalletConnection = simulateWalletConnection;
window.simulateWalletDisconnection = simulateWalletDisconnection;
window.clearVaultCache = clearVaultCache;

console.log('🚀 Vault Debug Functions Loaded!');
console.log('📋 Available functions:');
console.log('  - debugVaultRetrieval() - Debug vault data retrieval');
console.log('  - simulateWalletConnection() - Simulate wallet connection event');
console.log('  - simulateWalletDisconnection() - Simulate wallet disconnection event');
console.log('  - clearVaultCache() - Clear vault cache from localStorage');
console.log('');
console.log('💡 Instructions:');
console.log('1. Connect a wallet first');
console.log('2. Run debugVaultRetrieval() to check vault data');
console.log('3. If data exists in backend but not in frontend, try simulateWalletConnection()');

