// dayTrackerController.js
const DayTrackerModel = require('../models/dayTrackerModel');

class DayTrackerController {
  // Get all day trackers for a user
  static async getUserDayTrackers(req, res) {
    try {
      const userId = req.user ? req.user.id : req.params.userId || req.query.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const dayTrackers = await DayTrackerModel.findDayTrackersWithTracking(parseInt(userId));

      // Group by day for easier frontend handling
      const groupedByDay = {};
      dayTrackers.forEach(tracker => {
        if (!groupedByDay[tracker.dayInWeek]) {
          groupedByDay[tracker.dayInWeek] = [];
        }
        groupedByDay[tracker.dayInWeek].push(tracker);
      });

      res.json({
        success: true,
        data: {
          dayTrackers: dayTrackers,
          groupedByDay: groupedByDay,
          totalTrackers: dayTrackers.length
        }
      });
    } catch (error) {
      console.error('Error fetching user day trackers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching day trackers',
        error: error.message
      });
    }
  }

  // Create a new day tracker entry
  static async createDayTracker(req, res) {
    try {
      const { exercisePlanId, dayInWeek } = req.body;
      const userId = req.user ? req.user.id : req.body.userId;

      if (!exercisePlanId || !dayInWeek || !userId) {
        return res.status(400).json({
          success: false,
          message: 'exercisePlanId, dayInWeek, and userId are required'
        });
      }

      // Check if day tracker already exists
      const existingTracker = await DayTrackerModel.findExistingDayTracker(
        userId, 
        exercisePlanId, 
        dayInWeek
      );

      if (existingTracker) {
        return res.status(400).json({
          success: false,
          message: 'Day tracker already exists for this exercise plan and day'
        });
      }

      const dayTracker = await DayTrackerModel.createDayTracker(
        userId, 
        exercisePlanId, 
        dayInWeek
      );

      // Get the created tracker with relations
      const trackerWithRelations = await DayTrackerModel.findDayTrackerById(dayTracker.id);

      res.status(201).json({
        success: true,
        message: 'Day tracker created successfully',
        data: trackerWithRelations
      });
    } catch (error) {
      console.error('Error creating day tracker:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating day tracker',
        error: error.message
      });
    }
  }

  // Create multiple day tracker entries (bulk)
  static async createBulkDayTrackers(req, res) {
    try {
      const { dayTrackers } = req.body;
      const userId = req.user ? req.user.id : req.body.userId;

      if (!Array.isArray(dayTrackers) || dayTrackers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'dayTrackers array is required and must not be empty'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // Validate and prepare data
      const validatedTrackers = [];
      for (const tracker of dayTrackers) {
        const { exercisePlanId, dayInWeek } = tracker;
        
        if (!exercisePlanId || !dayInWeek) {
          console.warn('Skipping invalid tracker:', tracker);
          continue;
        }

        // Check if already exists
        const existing = await DayTrackerModel.findExistingDayTracker(
          userId, 
          exercisePlanId, 
          dayInWeek
        );

        if (!existing) {
          validatedTrackers.push({
            userId: parseInt(userId),
            exercisePlanId: parseInt(exercisePlanId),
            dayInWeek: dayInWeek
          });
        }
      }

      if (validatedTrackers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid day trackers to create (all may already exist)'
        });
      }

      const result = await DayTrackerModel.createBulkDayTrackers(validatedTrackers);

      res.status(201).json({
        success: true,
        message: `Successfully created ${result.count} day trackers`,
        data: {
          created: result.count,
          total: dayTrackers.length
        }
      });
    } catch (error) {
      console.error('Error creating bulk day trackers:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bulk day trackers',
        error: error.message
      });
    }
  }

  // Get day trackers for a specific day
  static async getDayTrackersByDay(req, res) {
    try {
      const { userId, dayInWeek } = req.params;
      const requestingUserId = req.user ? req.user.id : null;

      if (!userId || !dayInWeek) {
        return res.status(400).json({
          success: false,
          message: 'userId and dayInWeek are required'
        });
      }

      // Check if user can access this data
      if (requestingUserId && parseInt(userId) !== requestingUserId) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own day trackers'
        });
      }

      const dayTrackers = await DayTrackerModel.findDayTrackersByDay(
        parseInt(userId), 
        dayInWeek
      );

      res.json({
        success: true,
        data: {
          dayTrackers: dayTrackers,
          day: dayInWeek,
          count: dayTrackers.length
        }
      });
    } catch (error) {
      console.error('Error fetching day trackers by day:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching day trackers by day',
        error: error.message
      });
    }
  }

  // Update day tracker
  static async updateDayTracker(req, res) {
    try {
      const { id } = req.params;
      const { dayInWeek } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!dayInWeek) {
        return res.status(400).json({
          success: false,
          message: 'dayInWeek is required'
        });
      }

      const existingTracker = await DayTrackerModel.findDayTrackerById(parseInt(id));
      if (!existingTracker) {
        return res.status(404).json({
          success: false,
          message: 'Day tracker not found'
        });
      }

      // Check if user owns the tracker
      if (userId && existingTracker.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own day trackers'
        });
      }

      const updatedTracker = await DayTrackerModel.updateDayTracker(parseInt(id), {
        dayInWeek: dayInWeek
      });

      const trackerWithRelations = await DayTrackerModel.findDayTrackerById(updatedTracker.id);

      res.json({
        success: true,
        message: 'Day tracker updated successfully',
        data: trackerWithRelations
      });
    } catch (error) {
      console.error('Error updating day tracker:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating day tracker',
        error: error.message
      });
    }
  }

  // Delete day tracker
  static async deleteDayTracker(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const existingTracker = await DayTrackerModel.findDayTrackerById(parseInt(id));
      if (!existingTracker) {
        return res.status(404).json({
          success: false,
          message: 'Day tracker not found'
        });
      }

      // Check if user owns the tracker
      if (userId && existingTracker.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own day trackers'
        });
      }

      await DayTrackerModel.deleteDayTracker(parseInt(id));

      res.json({
        success: true,
        message: 'Day tracker deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting day tracker:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting day tracker',
        error: error.message
      });
    }
  }

  // Delete all day trackers for a user
  static async deleteUserDayTrackers(req, res) {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user ? req.user.id : null;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // Check if user can delete these trackers
      if (requestingUserId && parseInt(userId) !== requestingUserId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own day trackers'
        });
      }

      const result = await DayTrackerModel.deleteDayTrackersByUserId(parseInt(userId));

      res.json({
        success: true,
        message: `Successfully deleted ${result.count} day trackers`,
        data: { count: result.count }
      });
    } catch (error) {
      console.error('Error deleting user day trackers:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user day trackers',
        error: error.message
      });
    }
  }

  // Get all day trackers (admin function)
  static async getAllDayTrackers(req, res) {
    try {
      const dayTrackers = await DayTrackerModel.findAllDayTrackers();

      res.json({
        success: true,
        data: {
          dayTrackers: dayTrackers,
          count: dayTrackers.length
        }
      });
    } catch (error) {
      console.error('Error fetching all day trackers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching all day trackers',
        error: error.message
      });
    }
  }
}

module.exports = DayTrackerController;

