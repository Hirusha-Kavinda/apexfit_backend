const ExercisePlanModel = require('../models/exercisePlanModel');

class ExercisePlanController {
  static async getUserExercisePlans(req, res) {
    try {
      const userId = req.user.id;
      const exercisePlans = await ExercisePlanModel.findExercisePlansByUserId(userId);

      // Format exercise plans for frontend
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
      }));

      res.json({ exercisePlans: formattedExercisePlans });
    } catch (error) {
      console.error('Error fetching user exercise plans:', error);
      res.status(500).json({ message: 'Error fetching exercise plans', error: error.message });
    }
  }

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

      res.json({ exercisePlans: formattedExercisePlans });
    } catch (error) {
      console.error('Error fetching all exercise plans:', error);
      res.status(500).json({ message: 'Error fetching all exercise plans', error: error.message });
    }
  }

  static async createExercisePlan(req, res) {
    try {
      const { day, name, sets, reps, duration } = req.body;
      const userId = req.user.id;

      if (!day || !name || !sets || !reps || !duration) {
        return res.status(400).json({ message: 'Day, name, sets, reps, and duration are required' });
      }

      const exercisePlan = await ExercisePlanModel.createExercisePlan(userId, day, name, sets, reps, duration);

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
      });
    } catch (error) {
      console.error('Error creating exercise plan:', error);
      res.status(500).json({ message: 'Error creating exercise plan', error: error.message });
    }
  }

  static async updateExercisePlan(req, res) {
    try {
      const { id } = req.params;
      const { day, name, sets, reps, duration } = req.body;
      const userId = req.user.id;

      const existingExercisePlan = await ExercisePlanModel.findExercisePlanById(parseInt(id));
      if (!existingExercisePlan) {
        return res.status(404).json({ message: 'Exercise plan not found' });
      }

      // Check if user owns the exercise plan or is admin
      if (existingExercisePlan.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only update your own exercise plans' });
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
      });
    } catch (error) {
      console.error('Error updating exercise plan:', error);
      res.status(500).json({ message: 'Error updating exercise plan', error: error.message });
    }
  }

  static async deleteExercisePlan(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingExercisePlan = await ExercisePlanModel.findExercisePlanById(parseInt(id));
      if (!existingExercisePlan) {
        return res.status(404).json({ message: 'Exercise plan not found' });
      }

      // Check if user owns the exercise plan or is admin
      if (existingExercisePlan.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only delete your own exercise plans' });
      }

      await ExercisePlanModel.deleteExercisePlan(parseInt(id));
      res.json({
        message: 'Exercise plan deleted successfully',
        deletedExercisePlanId: parseInt(id),
      });
    } catch (error) {
      console.error('Error deleting exercise plan:', error);
      res.status(500).json({ message: 'Error deleting exercise plan', error: error.message });
    }
  }

  static async getExercisePlanById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const exercisePlan = await ExercisePlanModel.findExercisePlanByIdWithUser(parseInt(id));
      if (!exercisePlan) {
        return res.status(404).json({ message: 'Exercise plan not found' });
      }

      // Check if user owns the exercise plan or is admin
      if (exercisePlan.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You can only access your own exercise plans' });
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

      res.json({ exercisePlan: formattedExercisePlan });
    } catch (error) {
      console.error('Error fetching exercise plan:', error);
      res.status(500).json({ message: 'Error fetching exercise plan', error: error.message });
    }
  }
}

module.exports = ExercisePlanController;