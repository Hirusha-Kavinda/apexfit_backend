# Admin Management Scripts

This directory contains scripts for managing admin users in the ApexFit application.

## Scripts

### 1. createAdmin.js
Creates a new admin user with the specified credentials.

**Usage:**
```bash
node scripts/createAdmin.js
```

**Default Admin Credentials:**
- Email: admin@gmail.com
- Password: 123
- Role: ADMIN

### 2. verifyAdmin.js
Verifies that the admin user exists and displays their details.

**Usage:**
```bash
node scripts/verifyAdmin.js
```

### 3. testAdminLogin.js
Tests the admin login functionality by verifying the password.

**Usage:**
```bash
node scripts/testAdminLogin.js
```

### 4. adminManager.js
Comprehensive admin management script with multiple commands.

**Usage:**
```bash
# Create admin user
node scripts/adminManager.js create [email] [password]

# List all admin users
node scripts/adminManager.js list

# Test admin login
node scripts/adminManager.js test [email] [password]

# Delete admin user
node scripts/adminManager.js delete [email]
```

**Examples:**
```bash
# Create default admin
node scripts/adminManager.js create

# Create custom admin
node scripts/adminManager.js create admin2@example.com mypassword123

# List all admins
node scripts/adminManager.js list

# Test login
node scripts/adminManager.js test admin@gmail.com 123

# Delete admin
node scripts/adminManager.js delete admin@gmail.com
```

## Current Admin User

The following admin user has been created and is ready to use:

- **Email:** admin@gmail.com
- **Password:** 123
- **Role:** ADMIN
- **ID:** 1
- **Created:** 2025-09-15T12:12:35.422Z

## Security Notes

- Admin passwords are hashed using bcryptjs with a salt rounds of 10
- Admin users have full access to all admin features
- Always use strong passwords in production environments
- Consider changing the default password after initial setup

## Database Schema

The admin user is stored in the `User` table with the following structure:
- `id`: Auto-incrementing primary key
- `firstName`: Admin's first name
- `lastName`: Admin's last name
- `birthday`: Date of birth (default: 1990-01-01)
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (ADMIN for admin users)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp







