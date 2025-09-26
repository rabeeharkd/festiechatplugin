// Test utility to verify backend connectivity
const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';

export const testBackendConnectivity = async () => {
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Basic health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Chats endpoint
    console.log('Test 2: Chats endpoint test...');
    const authResponse = await fetch(`${BACKEND_URL}/chats`);
    console.log('Chats endpoint status:', authResponse.status);
    
    // Test 3: Registration endpoint (should return validation error)
    console.log('Test 3: Registration endpoint test...');
    const regResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        // Intentionally empty to test validation
      })
    });
    console.log('Registration endpoint status:', regResponse.status);
    const regData = await regResponse.json();
    console.log('Registration response:', regData);
    
    console.log('✅ Backend connectivity tests completed');
    return true;
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error);
    return false;
  }
};

// Test with known working credentials
export const testLogin = async () => {
  console.log('🔐 Testing login functionality...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@festiechat.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', response.status);
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      console.log('✅ Login test successful');
      return data;
    } else {
      console.log('❌ Login test failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
    return null;
  }
};

// Call these functions from browser console to test:
// import { testBackendConnectivity, testLogin } from './src/utils/testBackend.js'
// testBackendConnectivity()
// testLogin()