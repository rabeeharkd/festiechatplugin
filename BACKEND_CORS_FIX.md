# CORS Fix for Your Backend

## Problem Diagnosed ✅
Your backend is missing the `Access-Control-Allow-Origin` header when responding to requests from `https://fmsplugin.vercel.app`.

## Exact Backend Code Fix

### For Express.js Backend (Most Common)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration - ADD THIS BEFORE OTHER MIDDLEWARE
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://fmsplugin.vercel.app',       // ✅ Your production frontend
      'https://fms-chat.vercel.app',        // Old domain (remove after testing)
      'http://localhost:3000',              // Local development
      'http://localhost:5173',              // Vite dev server
      'http://localhost:5174'               // Alternative Vite port
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Blocking origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                        // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200                 // For legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Rest of your middleware and routes...
app.use(express.json());
// ... your other middleware

// Your routes here
// ... your routes

module.exports = app;
```

### Alternative Simple Version (if the above doesn't work)

```javascript
const cors = require('cors');

// Simple CORS setup
app.use(cors({
  origin: [
    'https://fmsplugin.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
```

### For Other Frameworks

#### Next.js API Routes
```javascript
// In your API route file
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://fmsplugin.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Your API logic here
}
```

#### Manual Headers (if not using cors package)
```javascript
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://fmsplugin.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});
```

## Steps to Fix

1. **Add the CORS code above to your backend**
2. **Deploy to Render**
3. **Test with this command:**
   ```bash
   curl -H "Origin: https://fmsplugin.vercel.app" -I https://festiechatplugin-backend-8g96.onrender.com/api/health
   ```
   You should see: `Access-Control-Allow-Origin: https://fmsplugin.vercel.app`

4. **Test your frontend** - login should work after backend redeploy

## Expected Result After Fix
- Status code: 200 (instead of 0)
- CORS headers present in response
- Login requests reach your backend successfully