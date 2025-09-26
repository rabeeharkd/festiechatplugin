// Database connection manager for frontend
// This handles API calls to the backend which connects to MongoDB

class DatabaseManager {
  constructor() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    this.baseUrl = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
    this.isConnected = false;
  }

  // Test database connectivity through backend
  async testConnection() {
    try {
      console.log('🔍 Testing database connection through backend...');
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
        this.isConnected = true;
        return { success: true, data };
      } else {
        console.log('❌ Backend connection failed:', response.status);
        this.isConnected = false;
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  // Initialize database connection
  async connect() {
    console.log('🚀 Initializing database connection...');
    
    try {
      // Test basic connectivity
      const healthCheck = await this.testConnection();
      if (!healthCheck.success) {
        throw new Error(`Backend health check failed: ${healthCheck.error}`);
      }

      console.log('✅ Database connection established successfully');

      return {
        success: true,
        message: 'Database connection established through backend API',
        endpoints: {
          base: this.baseUrl,
          auth: `${this.baseUrl}/auth`,
          chats: `${this.baseUrl}/chats`,
          messages: `${this.baseUrl}/messages`
        }
      };

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return {
        success: false,
        error: error.message,
        suggestion: 'Check if backend server is running and MongoDB is connected'
      };
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString()
    };
  }

  // Database operations through API
  async collections() {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('festie_access_token')}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }
    } catch (error) {
      console.error('Collections fetch error:', error);
      return { error: error.message };
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Auto-connect when module loads
dbManager.connect().then(result => {
  if (result.success) {
    console.log('🎉 Database connection ready!');
  } else {
    console.warn('⚠️ Database connection issues:', result.error);
  }
});

// Global access for debugging
window.dbManager = dbManager;

export default dbManager;