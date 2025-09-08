// exercisePlanController.js
const ExercisePlanModel = require('../models/exercisePlanModel');

class ExercisePlanController {
  // UPDATED METHOD - Only show active exercise plans by default
  static async getUserExercisePlans(req, res) {
    try {
      // Handle both authenticated users and admin access
      const userId = req.user ? req.user.id : req.params.userId || req.query.userId;
      const { includeInactive } = req.query; // Optional query parameter to include inactive plans
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required (either from authentication, path parameter, or query parameter)'
        });
      }

      // Convert userId to integer
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Get active plans by default, or all plans if includeInactive=true
      const exercisePlans = includeInactive === 'true' 
        ? await ExercisePlanModel.findExercisePlansByUserId(userIdInt)
        : await ExercisePlanModel.findActiveExercisePlansByUserId(userIdInt);

      // Format exercise plans for frontend
      const formattedExercisePlans = exercisePlans.map(plan => ({
        id: plan.id,
        day: plan.day,
        name: plan.name,
        sets: plan.sets,
        reps: plan.reps,
        duration: plan.duration,
        status: plan.status,
        planVersion: plan.planVersion,
        userId: plan.userId,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
      }));

      // NEW: Group by day for easier frontend handling
      const groupedPlans = formattedExercisePlans.reduce((acc, plan) => {
        if (!acc[plan.day]) {
          acc[plan.day] = [];
        }
        acc[plan.day].push(plan);
        return acc;
      }, {});

      res.json({ 
        exercisePlans: formattedExercisePlans,
        success: true,
        data: {
          raw: formattedExercisePlans,
          grouped: groupedPlans
        }
      });
    } catch (error) {
      console.error('Error fetching user exercise plans:', error);
      res.status(500).json({ 
        message: 'Error fetching exercise plans', 
        error: error.message,
        success: false
      });
    }
  }

  // EXISTING METHOD - Keep as is
  static async getAllExercisePlans(req, res) {
    try {
      const exercisePlans = await ExercisePlanModel.findAllExercisePlans();

      // Format exercise plans with user details
      const formattedExercisePlans = exercisePlans.map(plan => ({
        id: plan.id,
        day: plan.day,
        name: plan.name,
        sets: plan.sets,
        reps: plan.reps,
        duration: plan.duration,
        userId: plan.userId,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
        user: plan.user || null,
      }));

      res.json({ 
        exercisePlans: formattedExercisePlans,
        success: true,
        data: formattedExercisePlans
      });
    } catch (error) {
      console.error('Error fetching all exercise plans:', error);
      res.status(500).json({ 
        message: 'Error fetching all exercise plans', 
        error: error.message,
        success: false
      });
    }
  }

  // UPDATED METHOD - Handle both authenticated and admin access
  static async createExercisePlan(req, res) {
    try {
      const { day, name, sets, reps, duration, userId } = req.body;
      
      // Use userId from body if provided, otherwise from JWT token
      const finalUserId = userId || (req.user ? req.user.id : null);

      if (!day || !name || !sets || !reps || !duration) {
        return res.status(400).json({ 
          success: false,
          message: 'Day, name, sets, reps, and duration are required' 
        });
      }

      // Check if we have a valid userId
      if (!finalUserId) {
        return res.status(400).json({ 
          success: false,
          message: 'UserId is required (either from token or request body)' 
        });
      }

      const exercisePlan = await ExercisePlanModel.createExercisePlan(finalUserId, day, name, sets, reps, duration);

      // Get exercise plan with user details
      const exercisePlanWithUser = await ExercisePlanModel.findExercisePlanByIdWithUser(exercisePlan.id);

      // Format response
      const formattedExercisePlan = {
        id: exercisePlanWithUser.id,
        day: exercisePlanWithUser.day,
        name: exercisePlanWithUser.name,
        sets: exercisePlanWithUser.sets,
        reps: exercisePlanWithUser.reps,
        duration: exercisePlanWithUser.duration,
        userId: exercisePlanWithUser.userId,
        createdAt: exercisePlanWithUser.createdAt.toISOString(),
        updatedAt: exercisePlanWithUser.updatedAt.toISOString(),
        user: exercisePlanWithUser.user,
      };

      res.status(201).json({
        message: 'Exercise plan created successfully',
        exercisePlan: formattedExercisePlan,
        success: true,
        data: formattedExercisePlan
      });
    } catch (error) {
      console.error('Error creating exercise plan:', error);
      res.status(500).json({ 
        message: 'Error creating exercise plan', 
        error: error.message,
        success: false
      });
    }
  }

// Create bulk exercise plans with versioning system
static async createBulkExercisePlans(req, res) {
  try {
    console.log('Creating bulk exercise plans with versioning:', req.body);
    
    const exercisePlansData = req.body;
    
    if (!Array.isArray(exercisePlansData) || exercisePlansData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: Expected non-empty array of exercise plans'
      });
    }

    // Validate and prepare data
    const validatedPlans = [];
    for (const plan of exercisePlansData) {
      const { userId, day, name, sets, reps, duration } = plan;
      
      if (!userId || !day || !name) {
        console.warn('Skipping invalid plan:', plan);
        continue;
      }
      
      validatedPlans.push({
        userId: parseInt(userId),
        day: day.toString(),
        name: name.toString(),
        sets: parseInt(sets) || 3,
        reps: reps ? reps.toString() : "",
        duration: duration ? duration.toString() : ""
      });
    }
    
    if (validatedPlans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid exercise plans to create'
      });
    }

    // Get unique user IDs
    const userIds = [...new Set(validatedPlans.map(plan => plan.userId))];
    console.log('Processing exercise plans for users:', userIds);
    
    let totalCreated = 0;
    let totalDeactivated = 0;
    
    // Process each user separately for versioning
    for (const userId of userIds) {
      console.log(`Processing user ${userId}...`);
      
      // Get user's current active plans to determine next version
      const existingActivePlans = await ExercisePlanModel.findActiveExercisePlansByUserId(userId);
      const nextVersion = existingActivePlans.length > 0 ? 
        Math.max(...existingActivePlans.map(plan => plan.planVersion || 1)) + 1 : 1;
      
      console.log(`User ${userId} - Current version: ${nextVersion - 1}, Next version: ${nextVersion}`);
      
      // Deactivate existing active plans (set status to 'inactive')
      if (existingActivePlans.length > 0) {
        const deactivatedCount = await ExercisePlanModel.deactivateExercisePlansByUserId(userId);
        totalDeactivated += deactivatedCount;
        console.log(`Deactivated ${deactivatedCount} existing plans for user ${userId}`);
      }
      
      // Create new active plans with the new version
      const userPlans = validatedPlans.filter(plan => plan.userId === userId);
      const plansWithVersion = userPlans.map(plan => ({
        ...plan,
        status: 'active',
        planVersion: nextVersion
      }));
      
      console.log(`Creating ${plansWithVersion.length} new plans for user ${userId} with version ${nextVersion}`);
      const createResult = await ExercisePlanModel.createBulkExercisePlans(plansWithVersion);
      totalCreated += createResult.count;
    }
    
    // Fetch all newly created plans with user details
    const exercisePlansWithUsers = await ExercisePlanModel.findManyExercisePlansWithUsersByCriteria({
      userId: { in: userIds },
      status: 'active'
    });

    // Format response
    const formattedPlans = exercisePlansWithUsers.map(plan => ({
      id: plan.id,
      day: plan.day,
      name: plan.name,
      sets: plan.sets,
      reps: plan.reps,
      duration: plan.duration,
      status: plan.status,
      planVersion: plan.planVersion,
      userId: plan.userId,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      user: plan.user
    }));

    res.status(201).json({
      success: true,
      message: `Successfully created ${totalCreated} new exercise plans and deactivated ${totalDeactivated} old plans`,
      data: {
        created: totalCreated,
        deactivated: totalDeactivated,
        plans: formattedPlans
      }
    });
    
  } catch (error) {
    console.error('Error creating bulk exercise plans:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating bulk exercise plans', 
      error: error.message
    });
  }
}
  // NEW METHOD - Bulk upsert (create or update) to handle duplicates smartly
  static async upsertBulkExercisePlans(req, res) {
    try {
      const exercisePlansData = req.body;
      
      if (!Array.isArray(exercisePlansData) || exercisePlansData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input: Expected non-empty array of exercise plans'
        });
      }

      const results = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const planData of exercisePlansData) {
        try {
          const { day, name, sets, reps, duration, userId } = planData;
          const finalUserId = userId || (req.user ? req.user.id : null);

          if (!day || !name || !finalUserId) {
            results.errors.push({
              exercise: name || 'Unknown',
              error: 'Missing required fields'
            });
            continue;
          }

          // Check if exercise already exists
          const existingPlans = await ExercisePlanModel.findExercisePlansByUserId(finalUserId);
          const existing = existingPlans.find(plan => plan.day === day && plan.name === name);

          if (existing) {
            // Update existing
            await ExercisePlanModel.updateExercisePlan(existing.id, {
              sets: parseInt(sets) || existing.sets,
              reps: reps || existing.reps,
              duration: duration || existing.duration
            });
            results.updated++;
          } else {
            // Create new
            await ExercisePlanModel.createExercisePlan(finalUserId, day, name, parseInt(sets) || 3, reps, duration);
            results.created++;
          }
        } catch (planError) {
          results.errors.push({
            exercise: planData.name || 'Unknown',
            error: planError.message
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Operation completed: ${results.created} created, ${results.updated} updated`,
        data: results
      });
    } catch (error) {
      console.error('Error upserting bulk exercise plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process exercise plans',
        error: error.message
      });
    }
  }

  // UPDATED METHOD - Delete all exercise plans for a user
  static async deleteUserExercisePlans(req, res) {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user ? req.user.id : null;

      // Check if user can delete these plans (own plans or admin) - skip if no auth
      if (requestingUserId && parseInt(userId) !== requestingUserId && (!req.user || req.user.role !== 'ADMIN')) {
        return res.status(403).json({ 
          message: 'You can only delete your own exercise plans',
          success: false
        });
      }

      const deletedCount = await ExercisePlanModel.deleteExercisePlansByUserId(parseInt(userId));

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${deletedCount} exercise plans`,
        data: { count: deletedCount }
      });
    } catch (error) {
      console.error('Error deleting user exercise plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete exercise plans',
        error: error.message
      });
    }
  }

  // UPDATED METHOD - Handle both authenticated and admin access
  static async updateExercisePlan(req, res) {
    try {
      const { id } = req.params;
      const { day, name, sets, reps, duration } = req.body;
      const userId = req.user ? req.user.id : null;

      const existingExercisePlan = await ExercisePlanModel.findExercisePlanById(parseInt(id));
      if (!existingExercisePlan) {
        return res.status(404).json({ 
          message: 'Exercise plan not found',
          success: false
        });
      }

      // Check if user owns the exercise plan or is admin (skip check if no auth)
      if (userId && existingExercisePlan.userId !== userId && (!req.user || req.user.role !== 'ADMIN')) {
        return res.status(403).json({ 
          message: 'You can only update your own exercise plans',
          success: false
        });
      }

      const updateData = {};
      if (day !== undefined) updateData.day = day;
      if (name !== undefined) updateData.name = name;
      if (sets !== undefined) updateData.sets = sets;
      if (reps !== undefined) updateData.reps = reps;
      if (duration !== undefined) updateData.duration = duration;

      const updatedExercisePlan = await ExercisePlanModel.updateExercisePlan(parseInt(id), updateData);
      const exercisePlanWithUser = await ExercisePlanModel.findExercisePlanByIdWithUser(updatedExercisePlan.id);

      // Format response
      const formattedExercisePlan = {
        id: exercisePlanWithUser.id,
        day: exercisePlanWithUser.day,
        name: exercisePlanWithUser.name,
        sets: exercisePlanWithUser.sets,
        reps: exercisePlanWithUser.reps,
        duration: exercisePlanWithUser.duration,
        userId: exercisePlanWithUser.userId,
        createdAt: exercisePlanWithUser.createdAt.toISOString(),
        updatedAt: exercisePlanWithUser.updatedAt.toISOString(),
        user: exercisePlanWithUser.user,
      };

      res.json({
        message: 'Exercise plan updated successfully',
        exercisePlan: formattedExercisePlan,
        success: true,
        data: formattedExercisePlan
      });
    } catch (error) {
      console.error('Error updating exercise plan:', error);
      res.status(500).json({ 
        message: 'Error updating exercise plan', 
        error: error.message,
        success: false
      });
    }
  }

  // UPDATED METHOD - Handle both authenticated and admin access
  static async deleteExercisePlan(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const existingExercisePlan = await ExercisePlanModel.findExercisePlanById(parseInt(id));
      if (!existingExercisePlan) {
        return res.status(404).json({ 
          message: 'Exercise plan not found',
          success: false
        });
      }

      // Check if user owns the exercise plan or is admin (skip check if no auth)
      if (userId && existingExercisePlan.userId !== userId && (!req.user || req.user.role !== 'ADMIN')) {
        return res.status(403).json({ 
          message: 'You can only delete your own exercise plans',
          success: false
        });
      }

      await ExercisePlanModel.deleteExercisePlan(parseInt(id));
      res.json({
        message: 'Exercise plan deleted successfully',
        deletedExercisePlanId: parseInt(id),
        success: true
      });
    } catch (error) {
      console.error('Error deleting exercise plan:', error);
      res.status(500).json({ 
        message: 'Error deleting exercise plan', 
        error: error.message,
        success: false
      });
    }
  }

  // UPDATED METHOD - Handle both authenticated and admin access
  static async getExercisePlanById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const exercisePlan = await ExercisePlanModel.findExercisePlanByIdWithUser(parseInt(id));
      if (!exercisePlan) {
        return res.status(404).json({ 
          message: 'Exercise plan not found',
          success: false
        });
      }

      // Check if user owns the exercise plan or is admin (skip check if no auth)
      if (userId && exercisePlan.userId !== userId && (!req.user || req.user.role !== 'ADMIN')) {
        return res.status(403).json({ 
          message: 'You can only access your own exercise plans',
          success: false
        });
      }

      // Format response
      const formattedExercisePlan = {
        id: exercisePlan.id,
        day: exercisePlan.day,
        name: exercisePlan.name,
        sets: exercisePlan.sets,
        reps: exercisePlan.reps,
        duration: exercisePlan.duration,
        userId: exercisePlan.userId,
        createdAt: exercisePlan.createdAt.toISOString(),
        updatedAt: exercisePlan.updatedAt.toISOString(),
        user: exercisePlan.user,
      };

      res.json({ 
        exercisePlan: formattedExercisePlan,
        success: true,
        data: formattedExercisePlan
      });
    } catch (error) {
      console.error('Error fetching exercise plan:', error);
      res.status(500).json({ 
        message: 'Error fetching exercise plan', 
        error: error.message,
        success: false
      });
    }
  }
}

module.exports = ExercisePlanController;