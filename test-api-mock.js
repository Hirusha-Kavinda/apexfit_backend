/**
 * ApexFit API Mock Testing Script
 * Tests API endpoints without database dependency
 */

const axios = require('axios');
const baseURL = 'http://localhost:8080/api';

class MockAPITester {
  constructor() {
    this.results = [];
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async testServerConnection() {
    console.log('\n🌐 Testing Server Connection...');
    
    // Test basic server response
    const serverTest = await this.makeRequest('GET', '/auth/register');
    this.logResult('Server Connection', serverTest);
    
    return serverTest.success;
  }

  async testEndpointStructure() {
    console.log('\n🔍 Testing Endpoint Structure...');
    
    // Test various endpoints to see their structure
    const endpoints = [
      { method: 'GET', path: '/auth/register', name: 'Auth Register (GET)' },
      { method: 'POST', path: '/auth/register', name: 'Auth Register (POST)' },
      { method: 'POST', path: '/auth/login', name: 'Auth Login' },
      { method: 'GET', path: '/meetings', name: 'Meetings List' },
      { method: 'GET', path: '/userdetails', name: 'User Details' },
      { method: 'GET', path: '/exercise-plans', name: 'Exercise Plans' },
      { method: 'GET', path: '/exercise-tracking', name: 'Exercise Tracking' },
      { method: 'GET', path: '/day-trackers', name: 'Day Trackers' }
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint.method, endpoint.path);
      this.logResult(endpoint.name, result);
    }
  }

  async testErrorHandling() {
    console.log('\n❌ Testing Error Handling...');
    
    // Test invalid endpoint
    const invalidEndpoint = await this.makeRequest('GET', '/invalid-endpoint');
    this.logResult('Invalid Endpoint (404)', invalidEndpoint);
    
    // Test unauthorized access
    const unauthorizedAccess = await this.makeRequest('GET', '/auth/users');
    this.logResult('Unauthorized Access (401)', unauthorizedAccess);
    
    // Test invalid token
    const invalidToken = await this.makeRequest('GET', '/meetings', null, 'invalid-token');
    this.logResult('Invalid Token (401)', invalidToken);
    
    // Test malformed JSON
    try {
      const malformedRequest = await axios({
        method: 'POST',
        url: `${baseURL}/auth/register`,
        headers: { 'Content-Type': 'application/json' },
        data: '{"invalid": json}',
        timeout: 5000
      });
      this.logResult('Malformed JSON', { success: true, status: malformedRequest.status });
    } catch (error) {
      this.logResult('Malformed JSON', { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status || 400
      });
    }
  }

  async testCORSHeaders() {
    console.log('\n🌍 Testing CORS Headers...');
    
    try {
      const response = await axios({
        method: 'OPTIONS',
        url: `${baseURL}/auth/register`,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        timeout: 5000
      });
      
      this.logResult('CORS Preflight', { 
        success: true, 
        status: response.status,
        headers: response.headers
      });
    } catch (error) {
      this.logResult('CORS Preflight', { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500
      });
    }
  }

  async testServerHealth() {
    console.log('\n🏥 Testing Server Health...');
    
    // Test if server responds to basic requests
    const healthChecks = [
      { name: 'Server Root', url: 'http://localhost:8080' },
      { name: 'API Base', url: `${baseURL}` },
      { name: 'Auth Endpoint', url: `${baseURL}/auth` }
    ];

    for (const check of healthChecks) {
      try {
        const response = await axios.get(check.url, { timeout: 3000 });
        this.logResult(check.name, { 
          success: true, 
          status: response.status,
          data: typeof response.data === 'string' ? response.data.substring(0, 100) : response.data
        });
      } catch (error) {
        this.logResult(check.name, { 
          success: false, 
          error: error.message,
          status: error.response?.status || 500
        });
      }
    }
  }

  logResult(testName, result) {
    const status = result.success ? '✅' : '❌';
    let message = '';
    
    if (result.success) {
      message = `Status: ${result.status}`;
      if (result.data && typeof result.data === 'object') {
        message += ` | Response: ${JSON.stringify(result.data).substring(0, 100)}...`;
      }
    } else {
      message = `Error: ${result.error?.message || result.error}`;
      if (typeof message === 'object') {
        message = `Error: ${JSON.stringify(result.error).substring(0, 100)}...`;
      }
    }
    
    console.log(`${status} ${testName} - ${message}`);
    
    this.results.push({
      test: testName,
      success: result.success,
      status: result.status,
      data: result.data,
      error: result.error
    });
  }

  async runAllTests() {
    console.log('🚀 Starting ApexFit API Mock Tests...');
    console.log(`📡 Testing against: ${baseURL}`);
    
    try {
      const serverConnected = await this.testServerConnection();
      
      if (serverConnected) {
        await this.testServerHealth();
        await this.testEndpointStructure();
        await this.testErrorHandling();
        await this.testCORSHeaders();
      } else {
        console.log('❌ Server not responding, skipping other tests');
      }
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.test}: ${result.error?.message || result.error}`);
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('1. Fix database connection in .env file');
    console.log('2. Run database migrations: npx prisma migrate dev');
    console.log('3. Test with real data: node test-api.js');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new MockAPITester();
  tester.runAllTests().catch(console.error);
}

module.exports = MockAPITester;


