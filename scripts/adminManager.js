// adminManager.js - Comprehensive admin user management script
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AdminManager {
  // Create admin user
  static async createAdmin(email, password, firstName = 'Admin', lastName = 'User') {
    try {
      console.log(`Creating admin user: ${email}...`);
      
      // Check if admin already exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: email }
      });

      if (existingAdmin) {
        console.log('❌ Admin user already exists!');
        return { success: false, message: 'Admin already exists' };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          birthday: '1990-01-01', // Default birthday
          email: email,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin user created successfully!');
      return { success: true, admin: admin };
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      return { success: false, error: error.message };
    }
  }

  // List all admin users
  static async listAdmins() {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('📋 Admin Users:');
      if (admins.length === 0) {
        console.log('No admin users found.');
      } else {
        admins.forEach((admin, index) => {
          console.log(`${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
          console.log(`   ID: ${admin.id}, Created: ${admin.createdAt.toISOString()}`);
        });
      }

      return admins;
    } catch (error) {
      console.error('❌ Error listing admins:', error);
      return [];
    }
  }

  // Test admin login
  static async testLogin(email, password) {
    try {
      const admin = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!admin) {
        console.log('❌ Admin user not found!');
        return { success: false, message: 'Admin not found' };
      }

      if (admin.role !== 'ADMIN') {
        console.log('❌ User is not an admin!');
        return { success: false, message: 'User is not an admin' };
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (isPasswordValid) {
        console.log('✅ Admin login test successful!');
        return { success: true, admin: admin };
      } else {
        console.log('❌ Invalid password!');
        return { success: false, message: 'Invalid password' };
      }
    } catch (error) {
      console.error('❌ Error testing login:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete admin user
  static async deleteAdmin(email) {
    try {
      const admin = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!admin) {
        console.log('❌ Admin user not found!');
        return { success: false, message: 'Admin not found' };
      }

      if (admin.role !== 'ADMIN') {
        console.log('❌ User is not an admin!');
        return { success: false, message: 'User is not an admin' };
      }

      await prisma.user.delete({
        where: { email: email }
      });

      console.log('✅ Admin user deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      return { success: false, error: error.message };
    }
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];

  switch (command) {
    case 'create':
      await AdminManager.createAdmin(email || 'admin@gmail.com', password || '123');
      break;
    case 'list':
      await AdminManager.listAdmins();
      break;
    case 'test':
      await AdminManager.testLogin(email || 'admin@gmail.com', password || '123');
      break;
    case 'delete':
      await AdminManager.deleteAdmin(email || 'admin@gmail.com');
      break;
    default:
      console.log('Usage:');
      console.log('  node adminManager.js create [email] [password]');
      console.log('  node adminManager.js list');
      console.log('  node adminManager.js test [email] [password]');
      console.log('  node adminManager.js delete [email]');
      break;
  }

  await prisma.$disconnect();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AdminManager;

