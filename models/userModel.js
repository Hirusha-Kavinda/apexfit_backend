const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserModel {
  static async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        email: true,
        password: true,
        role: true,
      },
    });
  }

  static async createUser(firstName, lastName, birthday, email, password, role = 'USER') {
    return await prisma.user.create({
      data: {
        firstName,
        lastName,
        birthday: new Date(birthday), // Ensure birthday is a Date object
        email,
        password,
        role: role.toUpperCase(),
      },
    });
  }
}

module.exports = UserModel;