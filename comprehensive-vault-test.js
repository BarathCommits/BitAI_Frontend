/**
 * Comprehensive Vault Storage Test
 * This script tests the complete vault storage flow from frontend to backend
 * Run this in the browser console after the page loads
 */

async function comprehensiveVaultTest() {
  console.log('🧪 Starting Comprehensive Vault Storage Test...');
  
  // Step 1: Check current authentication status
  console.log('\n📋 Step 1: Checking Authentication Status');
  const token = localStorage.getItem('jwtToken');
  const walletAddress = localStorage.getItem('walletAddress');
  const user = localStorage.getItem('user');
  
  console.log('Current auth data:', {
    hasToken: !!token,
    hasWalletAddress: !!walletAddress,
    hasUser: !!user,
    tokenPreview: token ? `${token.substring(0, 30)}...` : 'none',
    walletAddress: walletAddress,
    userData: user ? JSON.parse(user) : null
  });
  
  if (!token || !walletAddress) {
    console.log('⚠️  No wallet connected. Please connect a wallet first using the header button.');
    console.log('💡 After connecting, run this test again.');
    return;
  }
  
  // Step 2: Test vault API endpoints
  console.log('\n📋 Step 2: Testing Vault API Endpoints');
  const API_BASE_URL = 'http://localhost:3000/api/v1';
  
  try {
    // Test GET endpoint
    console.log('📥 Testing GET /vault/info...');
    const getResponse = await fetch(`${API_BASE_URL}/vault/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const getData = await getResponse.json();
    console.log('GET Response:', {
      status: getResponse.status,
      success: getData.success,
      dataLength: Array.isArray(getData.data) ? getData.data.length : 'not array',
      data: getData.data,
      error: getData.error
    });
    
    // Step 3: Add test vault data
    console.log('\n📋 Step 3: Adding Test Vault Data');
    const testVaultData = {
      type: 'id_card',
      label: 'Test Personal Information',
      value: 'John Doe',
      category: 'personal',
      fields: {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com',
        'Phone Number': '+1-555-0123'
      },
      isEncrypted: false,
      walletAddress: walletAddress
    };
    
    console.log('📤 Sending test data:', testVaultData);
    
    const postResponse = await fetch(`${API_BASE_URL}/vault/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testVaultData)
    });
    
    const postData = await postResponse.json();
    console.log('POST Response:', {
      status: postResponse.status,
      success: postData.success,
      data: postData.data,
      error: postData.error
    });
    
    // Step 4: Verify data was stored
    if (postData.success) {
      console.log('\n📋 Step 4: Verifying Data Storage');
      
      // Wait a moment for the data to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const verifyResponse = await fetch(`${API_BASE_URL}/vault/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Verification Response:', {
        status: verifyResponse.status,
        success: verifyData.success,
        dataLength: Array.isArray(verifyData.data) ? verifyData.data.length : 'not array',
        data: verifyData.data
      });
      
      // Check if our test data is present
      if (Array.isArray(verifyData.data)) {
        const testDataFound = verifyData.data.find(item => item.label === 'Test Personal Information');
        if (testDataFound) {
          console.log('✅ SUCCESS: Test data was stored and retrieved!');
          console.log('Stored data:', testDataFound);
        } else {
          console.log('❌ FAILURE: Test data was not found in the retrieved data');
        }
      }
    } else {
      console.log('❌ FAILURE: Could not store test data');
      console.log('Error:', postData.error);
    }
    
    // Step 5: Test wallet disconnection and reconnection
    console.log('\n📋 Step 5: Testing Wallet Disconnection/Reconnection Flow');
    console.log('💡 To test this:');
    console.log('1. Disconnect your wallet using the header button');
    console.log('2. Check if vault data is cleared from localStorage');
    console.log('3. Reconnect the same wallet');
    console.log('4. Check if vault data is retrieved from backend');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('\n✅ Comprehensive Vault Test completed!');
}

// Additional utility functions
function clearVaultData() {
  console.log('🧹 Clearing vault data from localStorage...');
  localStorage.removeItem('vaultData');
  localStorage.removeItem('personalInfo');
  console.log('✅ Vault data cleared from localStorage');
}

function checkVaultData() {
  console.log('🔍 Checking current vault data in localStorage...');
  const vaultData = localStorage.getItem('vaultData');
  const personalInfo = localStorage.getItem('personalInfo');
  
  console.log('Vault data:', {
    vaultData: vaultData ? JSON.parse(vaultData) : null,
    personalInfo: personalInfo ? JSON.parse(personalInfo) : null
  });
}

// Export functions for use in browser console
window.comprehensiveVaultTest = comprehensiveVaultTest;
window.clearVaultData = clearVaultData;
window.checkVaultData = checkVaultData;

console.log('🚀 Comprehensive Vault Test functions loaded!');
console.log('📋 Available functions:');
console.log('  - comprehensiveVaultTest() - Run the full test');
console.log('  - clearVaultData() - Clear vault data from localStorage');
console.log('  - checkVaultData() - Check current vault data in localStorage');
console.log('');
console.log('💡 Instructions:');
console.log('1. Make sure you have a wallet connected');
console.log('2. Run comprehensiveVaultTest() to test vault storage');
console.log('3. Check the console output for results');

