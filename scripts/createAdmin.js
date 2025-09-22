// createAdmin.js - Script to create admin user
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Admin details:');
      console.log('- Email: admin@gmail.com');
      console.log('- Role:', existingAdmin.role);
      console.log('- ID:', existingAdmin.id);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        birthday: '1990-01-01', // Default birthday
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Admin details:');
    console.log('- Email: admin@gmail.com');
    console.log('- Password: 123');
    console.log('- Role: ADMIN');
    console.log('- ID:', admin.id);
    console.log('- Created at:', admin.createdAt);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin();

