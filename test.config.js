/**
 * Test Configuration for ApexFit Backend
 * This file contains test-specific configurations and utilities
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });

module.exports = {
  // Test database configuration
  testDatabase: {
    url: process.env.DATABASE_URL,
    name: 'apexfit_test_db'
  },

  // Test server configuration
  testServer: {
    port: process.env.PORT || 3001,
    host: 'localhost',
    baseUrl: `http://localhost:${process.env.PORT || 3001}`
  },

  // Test user credentials
  testUsers: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@apexfit.test',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
      role: 'ADMIN'
    },
    user: {
      email: process.env.TEST_USER_EMAIL || 'user@apexfit.test',
      password: process.env.TEST_USER_PASSWORD || 'user123',
      role: 'USER'
    }
  },

  // Test timeouts
  timeouts: {
    default: parseInt(process.env.TEST_TIMEOUT) || 10000,
    database: 5000,
    api: 8000
  },

  // Test data configuration
  testData: {
    meetingDuration: parseInt(process.env.TEST_MEETING_DURATION) || 60,
    exercisePlanVersion: parseInt(process.env.TEST_EXERCISE_PLAN_VERSION) || 1,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 4
  },

  // Feature flags for testing
  features: {
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    meetingReminders: process.env.ENABLE_MEETING_REMINDERS === 'true',
    exerciseTracking: process.env.ENABLE_EXERCISE_TRACKING === 'true',
    dayTracker: process.env.ENABLE_DAY_TRACKER === 'true'
  },

  // Cleanup configuration
  cleanup: {
    testDb: process.env.CLEANUP_TEST_DB === 'true',
    testFiles: true,
    tempData: true
  },

  // Logging configuration for tests
  logging: {
    level: process.env.LOG_LEVEL || 'error',
    enableConsole: false,
    enableFile: false
  },

  // JWT configuration for tests
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
    algorithm: 'HS256'
  },

  // SMTP configuration for tests
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.SMTP_FROM
  },

  // Test utilities
  utilities: {
    generateTestToken: (payload) => {
      const jwt = require('jsonwebtoken');
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    },
    
    generateTestUser: (overrides = {}) => {
      return {
        firstName: 'Test',
        lastName: 'User',
        birthday: '1990-01-01',
        email: `test${Date.now()}@apexfit.test`,
        password: 'testpassword123',
        role: 'USER',
        ...overrides
      };
    },

    generateTestMeeting: (userId, overrides = {}) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        userId,
        title: 'Test Meeting',
        description: 'Test meeting description',
        date: tomorrow.toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        status: 'pending',
        ...overrides
      };
    },

    generateTestExercisePlan: (userId, overrides = {}) => {
      return {
        userId,
        day: 'Monday',
        name: 'Test Exercise',
        sets: 3,
        reps: '10-12',
        duration: '30 minutes',
        status: 'active',
        planVersion: 1,
        ...overrides
      };
    }
  }
};


