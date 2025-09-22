const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's exercise plan with tracking data (using DayTracker system)
const getUserExercisePlan = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get current week start date (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get day trackers with exercise plans
    const dayTrackers = await prisma.dayTracker.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        exercisePlan: true
      },
      orderBy: {
        dayInWeek: 'asc'
      }
    });

    if (!dayTrackers || dayTrackers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No day trackers found for this user'
      });
    }

    // Get tracking data for current week
    const trackingData = await prisma.exerciseTracking.findMany({
      where: {
        userId: parseInt(userId),
        weekStartDate: currentWeekStart
      }
    });

    // Group exercises by day using day trackers
    const exercisesByDay = {};
    dayTrackers.forEach(tracker => {
      if (!exercisesByDay[tracker.dayInWeek]) {
        exercisesByDay[tracker.dayInWeek] = [];
      }
      
      // Find tracking data for this exercise
      const tracking = trackingData.find(t => t.exercisePlanId === tracker.exercisePlanId);
      
      exercisesByDay[tracker.dayInWeek].push({
        ...tracker.exercisePlan,
        dayTrackerId: tracker.id,
        day: tracker.dayInWeek, // Use dayInWeek from tracker
        tracking: tracking || {
          status: 'lost',
          completedAt: null
        }
      });
    });

    res.json({
      success: true,
      data: {
        exercisesByDay,
        currentWeekStart: currentWeekStart.toISOString(),
        totalExercises: dayTrackers.length,
        completedExercises: trackingData.filter(t => t.status === 'complete').length
      }
    });

  } catch (error) {
    console.error('Error fetching exercise plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise plan',
      error: error.message
    });
  }
};

// Mark exercise as complete
const markExerciseComplete = async (req, res) => {
  try {
    const { userId, exercisePlanId, day } = req.body;

    // Get current week start date (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    // Check if tracking already exists
    const existingTracking = await prisma.exerciseTracking.findFirst({
      where: {
        userId: parseInt(userId),
        exercisePlanId: parseInt(exercisePlanId),
        day: day,
        weekStartDate: currentWeekStart
      }
    });

    if (existingTracking) {
      // Update existing tracking
      const updatedTracking = await prisma.exerciseTracking.update({
        where: {
          id: existingTracking.id
        },
        data: {
          status: 'complete',
          completedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Exercise marked as complete',
        data: updatedTracking
      });
    } else {
      // Create new tracking record
      const newTracking = await prisma.exerciseTracking.create({
        data: {
          userId: parseInt(userId),
          exercisePlanId: parseInt(exercisePlanId),
          day: day,
          weekStartDate: currentWeekStart,
          status: 'complete',
          completedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Exercise marked as complete',
        data: newTracking
      });
    }

  } catch (error) {
    console.error('Error marking exercise complete:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking exercise complete',
      error: error.message
    });
  }
};

// Get weekly progress
const getWeeklyProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStartDate } = req.query;

    let weekStart;
    if (weekStartDate) {
      weekStart = new Date(weekStartDate);
    } else {
      // Current week
      const now = new Date();
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    }
    weekStart.setHours(0, 0, 0, 0);

    // Get tracking data for the week
    const trackingData = await prisma.exerciseTracking.findMany({
      where: {
        userId: parseInt(userId),
        weekStartDate: weekStart
      },
      include: {
        exercisePlan: true
      }
    });

    // Get total exercises for the week
    const totalExercises = await prisma.exercisePlan.count({
      where: {
        userId: parseInt(userId),
        status: 'active'
      }
    });

    const completedExercises = trackingData.filter(t => t.status === 'complete').length;
    const lostExercises = trackingData.filter(t => t.status === 'lost').length;

    res.json({
      success: true,
      data: {
        weekStartDate: weekStart.toISOString(),
        totalExercises,
        completedExercises,
        lostExercises,
        completionRate: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
        trackingData
      }
    });

  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly progress',
      error: error.message
    });
  }
};

module.exports = {
  getUserExercisePlan,
  markExerciseComplete,
  getWeeklyProgress
};



