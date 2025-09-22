// dayTrackerModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DayTrackerModel {
  // Create a new day tracker entry
  static async createDayTracker(userId, exercisePlanId, dayInWeek) {
    return await prisma.dayTracker.create({
      data: {
        userId: parseInt(userId),
        exercisePlanId: parseInt(exercisePlanId),
        dayInWeek: dayInWeek,
      },
    });
  }

  // Create multiple day tracker entries (bulk)
  static async createBulkDayTrackers(dayTrackerData) {
    return await prisma.dayTracker.createMany({
      data: dayTrackerData,
      skipDuplicates: true,
    });
  }

  // Get all day trackers for a user
  static async findDayTrackersByUserId(userId) {
    return await prisma.dayTracker.findMany({
      where: { userId: parseInt(userId) },
      include: {
        exercisePlan: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { dayInWeek: 'asc' },
    });
  }

  // Get day trackers for a specific day of the week
  static async findDayTrackersByDay(userId, dayInWeek) {
    return await prisma.dayTracker.findMany({
      where: { 
        userId: parseInt(userId),
        dayInWeek: dayInWeek
      },
      include: {
        exercisePlan: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get day trackers grouped by day
  static async findDayTrackersGroupedByDay(userId) {
    const dayTrackers = await prisma.dayTracker.findMany({
      where: { userId: parseInt(userId) },
      include: {
        exercisePlan: true,
      },
      orderBy: { dayInWeek: 'asc' },
    });

    // Group by day
    const groupedByDay = {};
    dayTrackers.forEach(tracker => {
      if (!groupedByDay[tracker.dayInWeek]) {
        groupedByDay[tracker.dayInWeek] = [];
      }
      groupedByDay[tracker.dayInWeek].push(tracker);
    });

    return groupedByDay;
  }

  // Get day tracker by ID
  static async findDayTrackerById(id) {
    return await prisma.dayTracker.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercisePlan: true,
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

  // Update day tracker
  static async updateDayTracker(id, data) {
    return await prisma.dayTracker.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  // Delete day tracker
  static async deleteDayTracker(id) {
    return await prisma.dayTracker.delete({
      where: { id: parseInt(id) },
    });
  }

  // Delete all day trackers for a user
  static async deleteDayTrackersByUserId(userId) {
    return await prisma.dayTracker.deleteMany({
      where: { userId: parseInt(userId) },
    });
  }

  // Delete day trackers for a specific exercise plan
  static async deleteDayTrackersByExercisePlanId(exercisePlanId) {
    return await prisma.dayTracker.deleteMany({
      where: { exercisePlanId: parseInt(exercisePlanId) },
    });
  }

  // Check if a day tracker already exists for user, exercise plan, and day
  static async findExistingDayTracker(userId, exercisePlanId, dayInWeek) {
    return await prisma.dayTracker.findFirst({
      where: {
        userId: parseInt(userId),
        exercisePlanId: parseInt(exercisePlanId),
        dayInWeek: dayInWeek,
      },
    });
  }

  // Get all day trackers (admin function)
  static async findAllDayTrackers() {
    return await prisma.dayTracker.findMany({
      include: {
        exercisePlan: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get day trackers with exercise tracking data for current week
  static async findDayTrackersWithTracking(userId) {
    // Get current week start date (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
    currentWeekStart.setHours(0, 0, 0, 0);

    const dayTrackers = await prisma.dayTracker.findMany({
      where: { userId: parseInt(userId) },
      include: {
        exercisePlan: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { dayInWeek: 'asc' },
    });

    // Get tracking data for current week
    const trackingData = await prisma.exerciseTracking.findMany({
      where: {
        userId: parseInt(userId),
        weekStartDate: currentWeekStart,
      },
    });

    // Add tracking data to day trackers
    const dayTrackersWithTracking = dayTrackers.map(tracker => {
      const tracking = trackingData.find(t => t.exercisePlanId === tracker.exercisePlanId);
      return {
        ...tracker,
        tracking: tracking || {
          status: 'lost',
          completedAt: null
        }
      };
    });

    return dayTrackersWithTracking;
  }
}

module.exports = DayTrackerModel;

