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
        birthday,
        email,
        password,
        role: role.toUpperCase(),
      },
    });
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        email: true,
        role: true,
        createdAt: true,
        userDetails: {
          select: {
            age: true,
            height: true,
            weight: true,
            daysPerWeek: true,
            gender: true,
            fitnessLevel: true,
            goal: true,
            medicalCondition: true,
          }
        },
        ExercisePlan: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

module.exports = UserModel;