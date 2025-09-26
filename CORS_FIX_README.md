# CORS Configuration Fix for Backend

## 🚨 Current Issue
The backend server is configured to only allow requests from:
```
Access-Control-Allow-Origin: https://fms-chat.vercel.app
```

But your frontend is running on:
```
http://localhost:5176
```

## 🔧 Backend Fix Required

### Option 1: Add Multiple Origins (Recommended)
In your backend CORS configuration, update to allow multiple origins:

```javascript
// For Express.js with cors middleware
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://fms-chat.vercel.app',          // Production frontend
    'http://localhost:3000',                // React dev server (common)
    'http://localhost:5173',                // Vite dev server (default)
    'http://localhost:5174',                // Vite dev server (alternate)
    'http://localhost:5175',                // Vite dev server (alternate)
    'http://localhost:5176',                // Your current dev server
    /^http:\/\/localhost:\d+$/              // Any localhost port (dev only)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### Option 2: Environment-Based Configuration
```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://fms-chat.vercel.app', 'https://your-production-domain.com']
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};
```

### Option 3: Dynamic CORS (Development Only)
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://fms-chat.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5176'
    ];
    
    // In development, allow any localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

## 🔄 Temporary Frontend Workaround

While waiting for backend CORS fix, I've:

1. ✅ **Re-enabled Mock API** - Your app will work with demo data
2. ✅ **Updated Vite Proxy** - Attempts to proxy requests with correct origin header
3. ✅ **Environment Configuration** - Ready to switch back when CORS is fixed

## 📝 Steps to Fix:

### For Backend Developer:
1. Update CORS configuration in your backend code
2. Add `http://localhost:5176` (and other dev ports) to allowed origins
3. Redeploy the backend to Render

### After Backend Fix:
1. Set `USE_MOCK_API = false` in `src/utils/mockAPI.js`
2. Update `.env` to use production URL:
   ```
   VITE_API_BASE_URL=https://festiechatplugin-backend-8g96.onrender.com
   ```
3. Test the connection

## 🧪 Testing CORS Fix

After backend update, test with:
```bash
curl -H "Origin: http://localhost:5176" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://festiechatplugin-backend-8g96.onrender.com/api/health
```

Should return headers including:
```
Access-Control-Allow-Origin: http://localhost:5176
```

## 🎯 Current Status

✅ **Frontend**: Working with mock data  
⚠️ **Backend Connection**: Blocked by CORS  
🔧 **Required**: Backend CORS configuration update  

Your app is functional for demo purposes while the backend CORS issue is resolved!