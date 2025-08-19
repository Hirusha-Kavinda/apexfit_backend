const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ExercisePlanModel {
  static async createExercisePlan(userId, day, name, sets, reps, duration) {
    return await prisma.exercisePlan.create({
      data: {
        userId,
        day,
        name,
        sets,
        reps,
        duration,
      },
    });
  }

  static async findExercisePlansByUserId(userId) {
    return await prisma.exercisePlan.findMany({
      where: { userId },
      orderBy: { day: 'asc' },
    });
  }

  static async findAllExercisePlans() {
    return await prisma.exercisePlan.findMany({
      orderBy: { day: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async findExercisePlanById(id) {
    return await prisma.exercisePlan.findUnique({
      where: { id },
    });
  }

  static async findExercisePlanByIdWithUser(id) {
    return await prisma.exercisePlan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateExercisePlan(id, data) {
    return await prisma.exercisePlan.update({
      where: { id },
      data,
    });
  }

  static async deleteExercisePlan(id) {
    return await prisma.exercisePlan.delete({
      where: { id },
    });
  }
}

module.exports = ExercisePlanModel;