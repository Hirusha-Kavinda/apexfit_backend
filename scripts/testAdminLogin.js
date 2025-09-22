// testAdminLogin.js - Script to test admin login
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare('123', admin.password);
    
    if (isPasswordValid) {
      console.log('✅ Admin login test successful!');
      console.log('Password verification: PASSED');
      console.log('Admin can login with:');
      console.log('- Email: admin@gmail.com');
      console.log('- Password: 123');
    } else {
      console.log('❌ Admin login test failed!');
      console.log('Password verification: FAILED');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testAdminLogin();

