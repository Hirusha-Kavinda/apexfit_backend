/**
 * Test Environment Setup Script for ApexFit Backend
 * This script helps set up the test environment and database
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

const prisma = new PrismaClient();

class TestEnvironmentSetup {
  constructor() {
    this.testConfig = require('../test.config.js');
  }

  /**
   * Initialize test database
   */
  async initializeTestDatabase() {
    try {
      console.log('🔄 Initializing test database...');
      
      // Test database connection
      await prisma.$connect();
      console.log('✅ Test database connection established');

      // Run any necessary migrations or setup
      console.log('🔄 Running test database setup...');
      
      // You can add specific test database setup here
      // For example, creating test tables, seeding data, etc.
      
      console.log('✅ Test database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing test database:', error);
      throw error;
    }
  }

  /**
   * Clean up test database
   */
  async cleanupTestDatabase() {
    try {
      console.log('🔄 Cleaning up test database...');
      
      if (this.testConfig.cleanup.testDb) {
        // Clean up test data
        await prisma.exerciseTracking.deleteMany();
        await prisma.dayTracker.deleteMany();
        await prisma.exercisePlan.deleteMany();
        await prisma.userDetails.deleteMany();
        await prisma.meeting.deleteMany();
        await prisma.user.deleteMany();
        
        console.log('✅ Test database cleaned up successfully');
      }
    } catch (error) {
      console.error('❌ Error cleaning up test database:', error);
      throw error;
    }
  }

  /**
   * Create test users
   */
  async createTestUsers() {
    try {
      console.log('🔄 Creating test users...');
      
      const bcrypt = require('bcryptjs');
      const { testUsers } = this.testConfig;

      // Create admin user
      const adminPassword = await bcrypt.hash(testUsers.admin.password, this.testConfig.testData.bcryptRounds);
      const adminUser = await prisma.user.upsert({
        where: { email: testUsers.admin.email },
        update: {},
        create: {
          firstName: 'Test',
          lastName: 'Admin',
          birthday: '1990-01-01',
          email: testUsers.admin.email,
          password: adminPassword,
          role: 'ADMIN'
        }
      });

      // Create regular user
      const userPassword = await bcrypt.hash(testUsers.user.password, this.testConfig.testData.bcryptRounds);
      const regularUser = await prisma.user.upsert({
        where: { email: testUsers.user.email },
        update: {},
        create: {
          firstName: 'Test',
          lastName: 'User',
          birthday: '1990-01-01',
          email: testUsers.user.email,
          password: userPassword,
          role: 'USER'
        }
      });

      console.log('✅ Test users created successfully');
      return { adminUser, regularUser };
    } catch (error) {
      console.error('❌ Error creating test users:', error);
      throw error;
    }
  }

  /**
   * Setup complete test environment
   */
  async setupTestEnvironment() {
    try {
      console.log('🚀 Setting up test environment...');
      
      await this.initializeTestDatabase();
      await this.cleanupTestDatabase();
      const testUsers = await this.createTestUsers();
      
      console.log('✅ Test environment setup completed successfully');
      console.log('📋 Test Configuration:');
      console.log(`   - Server Port: ${this.testConfig.testServer.port}`);
      console.log(`   - Database: ${this.testConfig.testDatabase.name}`);
      console.log(`   - Admin User: ${testUsers.adminUser.email}`);
      console.log(`   - Regular User: ${testUsers.regularUser.email}`);
      
      return testUsers;
    } catch (error) {
      console.error('❌ Error setting up test environment:', error);
      throw error;
    }
  }

  /**
   * Teardown test environment
   */
  async teardownTestEnvironment() {
    try {
      console.log('🔄 Tearing down test environment...');
      
      await this.cleanupTestDatabase();
      await prisma.$disconnect();
      
      console.log('✅ Test environment torn down successfully');
    } catch (error) {
      console.error('❌ Error tearing down test environment:', error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      setup.setupTestEnvironment()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'teardown':
      setup.teardownTestEnvironment()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'cleanup':
      setup.cleanupTestDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node setupTestEnv.js [setup|teardown|cleanup]');
      console.log('  setup    - Initialize complete test environment');
      console.log('  teardown - Clean up test environment');
      console.log('  cleanup  - Clean up test database only');
      process.exit(1);
  }
}

module.exports = TestEnvironmentSetup;


