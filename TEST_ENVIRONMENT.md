# ApexFit Backend - Test Environment Setup

This document explains how to set up and use the test environment for the ApexFit backend application.

## Environment Files

The project includes several environment configuration files:

- `.env.test` - Test environment configuration
- `.env.development` - Development environment configuration  
- `.env.example` - Template for environment variables
- `test.config.js` - Test configuration and utilities
- `scripts/setupTestEnv.js` - Test environment setup script

## Quick Start

### 1. Setup Test Environment

```bash
# Setup complete test environment (database, users, etc.)
npm run test:setup
```

### 2. Verify Test Environment

```bash
# Check if test environment variables are loaded correctly
npm run test:env
```

### 3. Cleanup After Testing

```bash
# Clean up test database
npm run test:cleanup

# Or tear down entire test environment
npm run test:teardown
```

## Environment Variables

### Core Configuration

| Variable | Description | Test Value |
|----------|-------------|------------|
| `NODE_ENV` | Environment mode | `test` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | Test database connection | `mysql://test_user:test_password@localhost:3306/apexfit_test_db` |
| `JWT_SECRET` | JWT signing secret | `test_jwt_secret_key_for_apexfit_backend_testing_only` |

### Email Configuration

| Variable | Description | Test Value |
|----------|-------------|------------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `465` |
| `SMTP_USER` | SMTP username | `test@apexfit.com` |
| `SMTP_PASS` | SMTP password | `test_app_password_here` |
| `SMTP_FROM` | From email address | `ApexFit Test <test@apexfit.com>` |

### Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@apexfit.test` | `admin123` |
| User | `user@apexfit.test` | `user123` |

### Feature Flags

| Variable | Description | Test Value |
|----------|-------------|------------|
| `ENABLE_EMAIL_NOTIFICATIONS` | Enable email notifications | `true` |
| `ENABLE_MEETING_REMINDERS` | Enable meeting reminders | `true` |
| `ENABLE_EXERCISE_TRACKING` | Enable exercise tracking | `true` |
| `ENABLE_DAY_TRACKER` | Enable day tracker | `true` |

## Test Configuration

The `test.config.js` file provides:

- **Database Configuration**: Test database settings
- **Server Configuration**: Test server settings
- **Test Users**: Predefined test user credentials
- **Timeouts**: Various timeout configurations
- **Feature Flags**: Test-specific feature toggles
- **Utilities**: Helper functions for testing

### Test Utilities

```javascript
const testConfig = require('./test.config.js');

// Generate test JWT token
const token = testConfig.utilities.generateTestToken({ id: 1, role: 'USER' });

// Generate test user data
const testUser = testConfig.utilities.generateTestUser({
  email: 'custom@test.com',
  role: 'ADMIN'
});

// Generate test meeting data
const testMeeting = testConfig.utilities.generateTestMeeting(userId, {
  title: 'Custom Meeting'
});
```

## Database Setup

### Prerequisites

1. **MySQL Server**: Ensure MySQL is running
2. **Test Database**: Create a separate test database
3. **Prisma**: Run migrations for test database

### Setup Commands

```bash
# Create test database
mysql -u root -p -e "CREATE DATABASE apexfit_test_db;"

# Run Prisma migrations for test environment
DATABASE_URL="mysql://test_user:test_password@localhost:3306/apexfit_test_db" npx prisma migrate deploy

# Setup test environment
npm run test:setup
```

## Running Tests

### Manual Testing

```bash
# Start server in test mode
NODE_ENV=test npm start

# Or use the test environment file
node -r dotenv/config server.js dotenv_config_path=.env.test
```

### Automated Testing

```bash
# Setup test environment
npm run test:setup

# Run your tests (when you implement them)
npm test

# Cleanup after tests
npm run test:cleanup
```

## Test Data Management

### Creating Test Data

The test setup script automatically creates:
- Admin user (`admin@apexfit.test`)
- Regular user (`user@apexfit.test`)
- Clean database tables

### Custom Test Data

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create custom test data
const customUser = await prisma.user.create({
  data: {
    firstName: 'Custom',
    lastName: 'TestUser',
    birthday: '1995-05-15',
    email: 'custom@test.com',
    password: 'hashedpassword',
    role: 'USER'
  }
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if MySQL is running
   mysql -u root -p -e "SHOW DATABASES;"
   
   # Verify test database exists
   mysql -u root -p -e "USE apexfit_test_db; SHOW TABLES;"
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Verify test environment
   npm run test:env
   
   # Check file permissions
   ls -la .env.test
   ```

3. **Port Already in Use**
   ```bash
   # Change port in .env.test
   PORT=3002
   
   # Or kill process using the port
   netstat -ano | findstr :3001
   ```

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## Security Notes

- Test environment uses separate database
- Test JWT secrets are different from production
- Test SMTP credentials are fake/mock
- All test data is isolated from production

## Contributing

When adding new environment variables:

1. Add to `.env.test` with test values
2. Add to `.env.example` with placeholder values
3. Update this documentation
4. Update `test.config.js` if needed

## File Structure

```
├── .env.test              # Test environment variables
├── .env.development       # Development environment variables
├── .env.example          # Environment template
├── test.config.js        # Test configuration and utilities
├── scripts/
│   └── setupTestEnv.js   # Test environment setup script
└── TEST_ENVIRONMENT.md   # This documentation
```


