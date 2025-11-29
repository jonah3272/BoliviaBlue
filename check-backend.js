#!/usr/bin/env node

/**
 * Backend Health Check Script
 * 
 * Quick diagnostic tool to test if the Railway backend is responding correctly.
 * Run this from your local machine to verify the backend is working.
 * 
 * Usage: node check-backend.js
 */

const https = require('https');

const BACKEND_URL = 'https://boliviablue-production.up.railway.app';
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${path}`;
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          duration: duration
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(name, path, validator) {
  log(`\n${colors.bright}Testing: ${name}${colors.reset}`, 'cyan');
  log(`URL: ${BACKEND_URL}${path}`, 'blue');
  
  try {
    const result = await makeRequest(path);
    
    log(`Status: ${result.statusCode}`, result.statusCode === 200 ? 'green' : 'yellow');
    log(`Duration: ${result.duration}ms`, result.duration < 1000 ? 'green' : 'yellow');
    
    if (result.statusCode === 200) {
      try {
        const json = JSON.parse(result.data);
        log(`Response:`, 'green');
        console.log(JSON.stringify(json, null, 2));
        
        if (validator) {
          const validationResult = validator(json);
          if (validationResult === true) {
            log(`✓ Validation passed`, 'green');
          } else {
            log(`✗ Validation failed: ${validationResult}`, 'red');
          }
        }
        
        return true;
      } catch (e) {
        log(`⚠ Response is not valid JSON`, 'yellow');
        log(`Raw response: ${result.data.substring(0, 200)}`, 'yellow');
        return false;
      }
    } else {
      log(`✗ Unexpected status code: ${result.statusCode}`, 'red');
      log(`Response: ${result.data.substring(0, 200)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Request failed: ${error.message}`, 'red');
    
    if (error.message === 'Request timeout') {
      log(`  → Backend is not responding (timeout after ${TIMEOUT}ms)`, 'red');
    } else if (error.code === 'ENOTFOUND') {
      log(`  → DNS lookup failed (domain not found)`, 'red');
    } else if (error.code === 'ECONNREFUSED') {
      log(`  → Connection refused (service is down)`, 'red');
    } else if (error.code === 'ECONNRESET') {
      log(`  → Connection reset (service crashed during request)`, 'red');
    }
    
    return false;
  }
}

async function runTests() {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`Bolivia Blue Backend Health Check`, 'bright');
  log(`${'='.repeat(60)}\n`, 'bright');
  
  log(`Backend URL: ${BACKEND_URL}`, 'cyan');
  log(`Timeout: ${TIMEOUT}ms`, 'cyan');
  log(`Time: ${new Date().toISOString()}`, 'cyan');
  
  const results = [];
  
  // Test 1: Health endpoint
  const healthOk = await testEndpoint(
    'Health Check',
    '/api/health',
    (json) => {
      if (!json.ok) return 'Missing "ok" field';
      if (!json.updated_at_iso) return 'Missing "updated_at_iso" field';
      return true;
    }
  );
  results.push({ name: 'Health Check', passed: healthOk });
  
  // Test 2: Blue rate endpoint
  const rateOk = await testEndpoint(
    'Blue Rate',
    '/api/blue-rate',
    (json) => {
      if (!json.buy || !json.sell) return 'Missing buy/sell rates';
      if (typeof json.buy !== 'number') return 'Buy rate is not a number';
      if (typeof json.sell !== 'number') return 'Sell rate is not a number';
      if (json.buy <= 0 || json.sell <= 0) return 'Rates must be positive';
      return true;
    }
  );
  results.push({ name: 'Blue Rate', passed: rateOk });
  
  // Test 3: Blue history endpoint
  const historyOk = await testEndpoint(
    'Blue History',
    '/api/blue-history?range=1D',
    (json) => {
      if (!Array.isArray(json)) return 'Response is not an array';
      if (json.length === 0) return 'No history data available';
      const first = json[0];
      if (!first.t || !first.buy || !first.sell) return 'Missing required fields in history data';
      return true;
    }
  );
  results.push({ name: 'Blue History', passed: historyOk });
  
  // Test 4: News endpoint
  const newsOk = await testEndpoint(
    'News',
    '/api/news',
    (json) => {
      if (!Array.isArray(json)) return 'Response is not an array';
      // News can be empty, that's ok
      if (json.length > 0) {
        const first = json[0];
        if (!first.title || !first.url) return 'Missing required fields in news data';
      }
      return true;
    }
  );
  results.push({ name: 'News', passed: newsOk });
  
  // Summary
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`Summary`, 'bright');
  log(`${'='.repeat(60)}\n`, 'bright');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });
  
  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log(`\n✅ All tests passed! Backend is healthy.`, 'green');
    log(`Your backend at ${BACKEND_URL} is working correctly.\n`, 'green');
    process.exit(0);
  } else {
    log(`\n⚠️  Some tests failed! Check Railway logs.`, 'yellow');
    log(`\nTroubleshooting steps:`, 'yellow');
    log(`1. Check Railway dashboard: https://railway.app/dashboard`, 'yellow');
    log(`2. Verify service is running (green status)`, 'yellow');
    log(`3. Check environment variables are set`, 'yellow');
    log(`4. View Railway logs for error messages\n`, 'yellow');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  log(`\n✗ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

