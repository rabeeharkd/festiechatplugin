// Test API connectivity with exact configuration
export const testApiConnectivity = async () => {
  console.log('🧪 Testing API connectivity to backend...');
  
  try {
    const response = await fetch('https://festiechatplugin-backend-8g96.onrender.com/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
      return { success: true, data };
    } else {
      console.log('❌ HTTP Error:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Network/CORS Error:', error.message);
    console.log('❌ Full Error:', error);
    return { success: false, error: error.message };
  }
};

// Test login endpoint specifically
export const testLoginEndpoint = async () => {
  console.log('🧪 Testing Login endpoint...');
  
  try {
    const response = await fetch('https://festiechatplugin-backend-8g96.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass'
      })
    });
    
    console.log('📊 Login Response Status:', response.status);
    console.log('📊 Login Response Headers:', [...response.headers.entries()]);
    
    if (response.status === 0) {
      console.log('❌ CORS Error - Request blocked by browser');
      return { success: false, error: 'CORS blocked' };
    }
    
    // Even if login fails (401), at least we know CORS is working
    const data = await response.json();
    console.log('📊 Login Response Data:', data);
    return { success: true, corsWorking: true, data };
    
  } catch (error) {
    console.log('❌ Login Test Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Run comprehensive API tests
export const runApiTests = async () => {
  console.log('🚀 Running comprehensive API tests...');
  
  const healthTest = await testApiConnectivity();
  const loginTest = await testLoginEndpoint();
  
  console.log('📋 Test Results Summary:');
  console.log('  Health Endpoint:', healthTest.success ? '✅ Working' : '❌ Failed');
  console.log('  Login Endpoint:', loginTest.success ? '✅ Working' : '❌ Failed');
  
  if (!healthTest.success && !loginTest.success) {
    console.log('🚨 CORS is still blocking requests!');
    console.log('🔧 Backend needs CORS configuration update');
  } else {
    console.log('✅ API connectivity working!');
  }
  
  return {
    health: healthTest,
    login: loginTest
  };
};

// Quick CORS test function
export const quickCorsTest = async () => {
  console.log('⚡ Quick CORS Test...');
  
  try {
    const response = await fetch('https://festiechatplugin-backend-8g96.onrender.com/api/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (response.status === 0) {
      console.log('❌ CORS STILL BLOCKED - Backend needs CORS fix');
      return false;
    }
    
    console.log('✅ CORS WORKING - Status:', response.status);
    const data = await response.json();
    console.log('📊 Response:', data);
    return true;
  } catch (error) {
    console.log('❌ CORS Error:', error.message);
    return false;
  }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.testApiConnectivity = testApiConnectivity;
  window.testLoginEndpoint = testLoginEndpoint;
  window.runApiTests = runApiTests;
  window.quickCorsTest = quickCorsTest;
  
  // Auto-run quick test on page load
  setTimeout(() => {
    console.log('🔧 Auto-running CORS test...');
    quickCorsTest();
  }, 2000);
}