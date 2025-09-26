// Simple test to check backend endpoints
export const testBackendEndpoints = async () => {
  const baseUrl = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  const endpoints = [
    '/',
    '/api',
    '/auth/login',
    '/api/auth/login',
    '/v1/auth/login',
    '/api/v1/auth/login'
  ];
  
  console.log('🔍 Testing backend endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: endpoint.includes('login') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.includes('login') ? JSON.stringify({}) : undefined
      });
      
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
};

// Call this function from browser console to test endpoints
window.testBackendEndpoints = testBackendEndpoints;