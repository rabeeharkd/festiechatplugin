// Database configuration and environment setup
export const DATABASE_CONFIG = {
  // Production MongoDB (via backend API)
  PRODUCTION: {
    API_URL: 'https://festiechatplugin-backend-8g96.onrender.com/api',
    SOCKET_URL: 'https://festiechatplugin-backend-8g96.onrender.com',
    DESCRIPTION: 'Production MongoDB Atlas cluster'
  },
  
  // Local development
  DEVELOPMENT: {
    API_URL: 'http://localhost:3001/api',
    SOCKET_URL: 'http://localhost:3001',
    DESCRIPTION: 'Local development server'
  },
  
  // Staging environment
  STAGING: {
    API_URL: 'https://festiechatplugin-backend-staging.onrender.com/api',
    SOCKET_URL: 'https://festiechatplugin-backend-staging.onrender.com',
    DESCRIPTION: 'Staging MongoDB cluster'
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  if (env === 'production') return DATABASE_CONFIG.PRODUCTION;
  if (env === 'development') return DATABASE_CONFIG.DEVELOPMENT;
  return DATABASE_CONFIG.DEVELOPMENT;
};

// Database operations helper
export const DatabaseOperations = {
  // Test all endpoints
  async testAllEndpoints() {
    const config = getCurrentConfig();
    const endpoints = [
      `${config.API_URL}/health`,
      `${config.API_URL}/chats`,
      `${config.API_URL}/users`
    ];

    console.log('🧪 Testing all database endpoints...');
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('festie_access_token')}`
          }
        });

        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          statusText: response.statusText
        });

        console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error.message
        });
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    return results;
  },

  // Check MongoDB connection through backend
  async checkMongoConnection() {
    const config = getCurrentConfig();
    
    try {
      const response = await fetch(`${config.API_URL}/database/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('festie_access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Database Status:', data);
        return data;
      } else {
        throw new Error(`Database status check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Database connection check failed:', error);
      return { connected: false, error: error.message };
    }
  }
};

// Export for global access
window.DatabaseOperations = DatabaseOperations;

console.log('🏗️ Database configuration loaded:', getCurrentConfig());