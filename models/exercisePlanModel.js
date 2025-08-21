// exercisePlanModel.js
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

  // NEW: Bulk create exercise plans
  static async createBulkExercisePlans(exercisePlansData) {
    return await prisma.exercisePlan.createMany({
      data: exercisePlansData,
      skipDuplicates: true, // Optional: skip duplicates if any
    });
  }

  // Alternative method if you need to return the created records (createMany doesn't return the records)
  static async createBulkExercisePlansWithReturn(exercisePlansData) {
    const createdPlans = [];
    
    // Use a transaction to ensure all plans are created or none
    await prisma.$transaction(async (tx) => {
      for (const planData of exercisePlansData) {
        const createdPlan = await tx.exercisePlan.create({
          data: planData,
        });
        createdPlans.push(createdPlan);
      }
    });

    return createdPlans;
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

  static async findManyExercisePlansWithUsersByCriteria(criteria, limit) {
    return await prisma.exercisePlan.findMany({
      where: criteria,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
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