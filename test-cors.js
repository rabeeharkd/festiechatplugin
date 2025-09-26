#!/usr/bin/env node

// Test script to verify CORS is working after backend fix
import https from 'https';

console.log('🧪 Testing CORS configuration...\n');

const testCORS = (url, origin) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const req = https.request(url, options, (res) => {
      const headers = res.headers;
      
      console.log(`🌐 Testing Origin: ${origin}`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`🔒 Allow-Origin: ${headers['access-control-allow-origin'] || 'NOT SET'}`);
      console.log(`🔐 Allow-Credentials: ${headers['access-control-allow-credentials'] || 'NOT SET'}`);
      console.log(`🛠️  Allow-Methods: ${headers['access-control-allow-methods'] || 'NOT SET'}`);
      console.log(`📝 Allow-Headers: ${headers['access-control-allow-headers'] || 'NOT SET'}`);
      console.log('---');
      
      const isWorking = headers['access-control-allow-origin'] === origin;
      resolve({ origin, working: isWorking, headers });
    });

    req.on('error', (error) => {
      console.log(`❌ Error testing ${origin}:`, error.message);
      reject(error);
    });

    req.end();
  });
};

async function runTests() {
  const baseUrl = 'https://festiechatplugin-backend-8g96.onrender.com/api/health';
  
  const origins = [
    'https://fmsplugin.vercel.app',
    'https://fms-chat.vercel.app',
    'http://localhost:3000'
  ];

  const results = [];
  
  for (const origin of origins) {
    try {
      const result = await testCORS(baseUrl, origin);
      results.push(result);
    } catch (error) {
      results.push({ origin, working: false, error: error.message });
    }
  }
  
  console.log('\n📋 SUMMARY:');
  results.forEach(result => {
    const status = result.working ? '✅ WORKING' : '❌ BLOCKED';
    console.log(`  ${result.origin}: ${status}`);
  });
  
  const workingCount = results.filter(r => r.working).length;
  console.log(`\n🎯 Result: ${workingCount}/${results.length} origins working`);
  
  if (workingCount === 0) {
    console.log('\n🚨 CORS is still not configured correctly!');
    console.log('📝 Make sure you:');
    console.log('   1. Added CORS configuration to your backend');
    console.log('   2. Deployed to Render');
    console.log('   3. Included https://fmsplugin.vercel.app in allowed origins');
  } else {
    console.log('\n🎉 CORS is working! Your frontend should be able to connect now.');
  }
}

runTests().catch(console.error);