const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserDetailsModel {
  // Create new user details record
  static async createUserDetails(userId, age, height, weight, daysPerWeek, gender, fitnessLevel, medicalCondition, goal) {
    return await prisma.userDetails.create({
      data: {
        userId,
        age,
        height,
        weight,
        daysPerWeek,
        gender,
        fitnessLevel,
        medicalCondition,
        goal,
      },
    });
  }

  // Get ALL user details
  static async getAllUserDetails() {
    return await prisma.userDetails.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  // Get user details by userId
  static async getUserDetailsByUser(userId) {
    return await prisma.userDetails.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single user details by ID
  static async getUserDetailsById(id) {
    return await prisma.userDetails.findUnique({
      where: { id: Number(id) },
    });
  }

  // Update user details
  static async updateUserDetails(id, updateData) {
    return await prisma.userDetails.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  // Delete user details
  static async deleteUserDetails(id) {
    return await prisma.userDetails.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = UserDetailsModel;
