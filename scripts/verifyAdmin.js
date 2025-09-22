// verifyAdmin.js - Script to verify admin user
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    console.log('Verifying admin user...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('Admin details:');
    console.log('- ID:', admin.id);
    console.log('- First Name:', admin.firstName);
    console.log('- Last Name:', admin.lastName);
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- Birthday:', admin.birthday);
    console.log('- Created at:', admin.createdAt);
    console.log('- Updated at:', admin.updatedAt);
    
    // Test login credentials
    console.log('\n📋 Login Credentials:');
    console.log('- Email: admin@gmail.com');
    console.log('- Password: 123');
    console.log('- Role: ADMIN');

  } catch (error) {
    console.error('❌ Error verifying admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyAdmin();

