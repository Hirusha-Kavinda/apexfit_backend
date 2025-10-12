/**
 * ApexFit API Testing Script
 * Comprehensive testing for all API endpoints
 */

const axios = require('axios');
const baseURL = 'http://localhost:8080/api';

// Test data
const testData = {
  admin: {
    firstName: 'Test',
    lastName: 'Admin',
    birthday: '1990-01-01',
    email: 'admin@apexfit.test',
    password: 'admin123',
    role: 'ADMIN'
  },
  user: {
    firstName: 'Test',
    lastName: 'User',
    birthday: '1995-05-15',
    email: 'user@apexfit.test',
    password: 'user123',
    role: 'USER'
  },
  meeting: {
    title: 'Test Meeting',
    description: 'This is a test meeting',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    startTime: '10:00',
    endTime: '11:00'
  },
  userDetails: {
    age: 25,
    height: 175,
    weight: 70,
    daysPerWeek: 5,
    gender: 'Male',
    fitnessLevel: 'Intermediate',
    medicalCondition: 'None',
    goal: 'Weight Loss'
  },
  exercisePlan: {
    day: 'Monday',
    name: 'Push-ups',
    sets: 3,
    reps: '10-15',
    duration: '30 minutes'
  }
};

class APITester {
  constructor() {
    this.tokens = {};
    this.userIds = {};
    this.results = [];
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
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

  async testAuthEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    // Test Admin Registration
    const adminReg = await this.makeRequest('POST', '/auth/register', testData.admin);
    this.logResult('Admin Registration', adminReg);
    
    // Test User Registration
    const userReg = await this.makeRequest('POST', '/auth/register', testData.user);
    this.logResult('User Registration', userReg);
    
    // Test Admin Login
    const adminLogin = await this.makeRequest('POST', '/auth/login', {
      email: testData.admin.email,
      password: testData.admin.password
    });
    this.logResult('Admin Login', adminLogin);
    if (adminLogin.success) {
      this.tokens.admin = adminLogin.data.token;
    }
    
    // Test User Login
    const userLogin = await this.makeRequest('POST', '/auth/login', {
      email: testData.user.email,
      password: testData.user.password
    });
    this.logResult('User Login', userLogin);
    if (userLogin.success) {
      this.tokens.user = userLogin.data.token;
      this.userIds.user = userLogin.data.user.id;
    }
    
    // Test Get All Users (Admin only)
    const getAllUsers = await this.makeRequest('GET', '/auth/users', null, this.tokens.admin);
    this.logResult('Get All Users (Admin)', getAllUsers);
  }

  async testMeetingEndpoints() {
    console.log('\n📅 Testing Meeting Endpoints...');
    
    if (!this.tokens.user) {
      console.log('❌ No user token available for meeting tests');
      return;
    }
    
    // Create Meeting
    const createMeeting = await this.makeRequest('POST', '/meetings', testData.meeting, this.tokens.user);
    this.logResult('Create Meeting', createMeeting);
    const meetingId = createMeeting.success ? createMeeting.data.id : null;
    
    // Get User Meetings
    const getUserMeetings = await this.makeRequest('GET', '/meetings', null, this.tokens.user);
    this.logResult('Get User Meetings', getUserMeetings);
    
    if (meetingId) {
      // Update Meeting
      const updateMeeting = await this.makeRequest('PUT', `/meetings/${meetingId}`, {
        ...testData.meeting,
        title: 'Updated Test Meeting'
      }, this.tokens.user);
      this.logResult('Update Meeting', updateMeeting);
      
      // Delete Meeting
      const deleteMeeting = await this.makeRequest('DELETE', `/meetings/${meetingId}`, null, this.tokens.user);
      this.logResult('Delete Meeting', deleteMeeting);
    }
  }

  async testUserDetailsEndpoints() {
    console.log('\n👤 Testing User Details Endpoints...');
    
    if (!this.tokens.user || !this.userIds.user) {
      console.log('❌ No user token or user ID available for user details tests');
      return;
    }
    
    // Create User Details
    const createUserDetails = await this.makeRequest('POST', '/userdetails', {
      ...testData.userDetails,
      userId: this.userIds.user
    }, this.tokens.user);
    this.logResult('Create User Details', createUserDetails);
    
    // Get User Details
    const getUserDetails = await this.makeRequest('GET', `/userdetails/${this.userIds.user}`, null, this.tokens.user);
    this.logResult('Get User Details', getUserDetails);
    
    // Update User Details
    if (createUserDetails.success) {
      const updateUserDetails = await this.makeRequest('PUT', `/userdetails/${createUserDetails.data.id}`, {
        ...testData.userDetails,
        weight: 75,
        goal: 'Muscle Gain'
      }, this.tokens.user);
      this.logResult('Update User Details', updateUserDetails);
    }
  }

  async testExercisePlanEndpoints() {
    console.log('\n💪 Testing Exercise Plan Endpoints...');
    
    if (!this.tokens.user || !this.userIds.user) {
      console.log('❌ No user token or user ID available for exercise plan tests');
      return;
    }
    
    // Create Exercise Plan
    const createExercisePlan = await this.makeRequest('POST', '/exercise-plans', {
      ...testData.exercisePlan,
      userId: this.userIds.user
    }, this.tokens.user);
    this.logResult('Create Exercise Plan', createExercisePlan);
    const exercisePlanId = createExercisePlan.success ? createExercisePlan.data.id : null;
    
    // Get User Exercise Plans
    const getUserExercisePlans = await this.makeRequest('GET', `/exercise-plans/user/${this.userIds.user}`, null, this.tokens.user);
    this.logResult('Get User Exercise Plans', getUserExercisePlans);
    
    if (exercisePlanId) {
      // Update Exercise Plan
      const updateExercisePlan = await this.makeRequest('PUT', `/exercise-plans/${exercisePlanId}`, {
        ...testData.exercisePlan,
        sets: 4,
        reps: '12-15'
      }, this.tokens.user);
      this.logResult('Update Exercise Plan', updateExercisePlan);
      
      // Delete Exercise Plan
      const deleteExercisePlan = await this.makeRequest('DELETE', `/exercise-plans/${exercisePlanId}`, null, this.tokens.user);
      this.logResult('Delete Exercise Plan', deleteExercisePlan);
    }
  }

  async testExerciseTrackingEndpoints() {
    console.log('\n📊 Testing Exercise Tracking Endpoints...');
    
    if (!this.tokens.user || !this.userIds.user) {
      console.log('❌ No user token or user ID available for exercise tracking tests');
      return;
    }
    
    // First create an exercise plan for tracking
    const createExercisePlan = await this.makeRequest('POST', '/exercise-plans', {
      ...testData.exercisePlan,
      userId: this.userIds.user
    }, this.tokens.user);
    
    if (createExercisePlan.success) {
      const exercisePlanId = createExercisePlan.data.id;
      
      // Create Exercise Tracking
      const createTracking = await this.makeRequest('POST', '/exercise-tracking', {
        userId: this.userIds.user,
        exercisePlanId: exercisePlanId,
        day: 'Monday',
        weekStartDate: new Date().toISOString(),
        status: 'complete'
      }, this.tokens.user);
      this.logResult('Create Exercise Tracking', createTracking);
      
      // Get User Exercise Tracking
      const getUserTracking = await this.makeRequest('GET', `/exercise-tracking/user/${this.userIds.user}`, null, this.tokens.user);
      this.logResult('Get User Exercise Tracking', getUserTracking);
    }
  }

  async testDayTrackerEndpoints() {
    console.log('\n📅 Testing Day Tracker Endpoints...');
    
    if (!this.tokens.user || !this.userIds.user) {
      console.log('❌ No user token or user ID available for day tracker tests');
      return;
    }
    
    // First create an exercise plan for day tracking
    const createExercisePlan = await this.makeRequest('POST', '/exercise-plans', {
      ...testData.exercisePlan,
      userId: this.userIds.user
    }, this.tokens.user);
    
    if (createExercisePlan.success) {
      const exercisePlanId = createExercisePlan.data.id;
      
      // Create Day Tracker
      const createDayTracker = await this.makeRequest('POST', '/day-trackers', {
        userId: this.userIds.user,
        exercisePlanId: exercisePlanId,
        dayInWeek: 'Monday'
      }, this.tokens.user);
      this.logResult('Create Day Tracker', createDayTracker);
      
      // Get User Day Trackers
      const getUserDayTrackers = await this.makeRequest('GET', `/day-trackers/user/${this.userIds.user}`, null, this.tokens.user);
      this.logResult('Get User Day Trackers', getUserDayTrackers);
    }
  }

  async testErrorHandling() {
    console.log('\n❌ Testing Error Handling...');
    
    // Test invalid endpoint
    const invalidEndpoint = await this.makeRequest('GET', '/invalid-endpoint');
    this.logResult('Invalid Endpoint', invalidEndpoint);
    
    // Test unauthorized access
    const unauthorizedAccess = await this.makeRequest('GET', '/auth/users');
    this.logResult('Unauthorized Access', unauthorizedAccess);
    
    // Test invalid token
    const invalidToken = await this.makeRequest('GET', '/meetings', null, 'invalid-token');
    this.logResult('Invalid Token', invalidToken);
  }

  logResult(testName, result) {
    const status = result.success ? '✅' : '❌';
    const message = result.success ? 
      `Status: ${result.status}` : 
      `Error: ${result.error?.message || result.error}`;
    
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
    console.log('🚀 Starting ApexFit API Tests...');
    console.log(`📡 Testing against: ${baseURL}`);
    
    try {
      await this.testAuthEndpoints();
      await this.testMeetingEndpoints();
      await this.testUserDetailsEndpoints();
      await this.testExercisePlanEndpoints();
      await this.testExerciseTrackingEndpoints();
      await this.testDayTrackerEndpoints();
      await this.testErrorHandling();
      
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
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;


