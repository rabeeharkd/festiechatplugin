import { apiCall } from '../services/api';

// Test CORS-enabled API calls
export const testCorsApiCall = async () => {
  console.log('🧪 Testing CORS-enabled API call...');
  
  try {
    // Test health endpoint
    const healthResponse = await apiCall('/api/health', {
      method: 'GET'
    });
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ CORS API Call Success:', data);
      return { success: true, data };
    } else {
      console.log('❌ API returned error:', healthResponse.status);
      return { success: false, error: `HTTP ${healthResponse.status}` };
    }
  } catch (error) {
    console.log('❌ CORS API Call Failed:', error);
    return { success: false, error: error.message };
  }
};

// Test login with CORS-enabled call
export const testCorsLogin = async (email = 'test@example.com', password = 'test123') => {
  console.log('🧪 Testing CORS-enabled login...');
  
  try {
    const loginResponse = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const data = await loginResponse.json();
    console.log('📊 Login Response:', loginResponse.status, data);
    
    return {
      success: loginResponse.ok,
      status: loginResponse.status,
      data
    };
  } catch (error) {
    console.log('❌ CORS Login Failed:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.testCorsApiCall = testCorsApiCall;
  window.testCorsLogin = testCorsLogin;
}