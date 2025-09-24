// dayTrackerRoutes.js
const express = require('express');
const router = express.Router();
const DayTrackerController = require('../controllers/dayTrackerController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all day trackers for authenticated user
router.get('/user', DayTrackerController.getUserDayTrackers);

// Get day trackers for a specific user (admin or self)
router.get('/user/:userId', DayTrackerController.getUserDayTrackers);

// Get day trackers for a specific day
router.get('/user/:userId/day/:dayInWeek', DayTrackerController.getDayTrackersByDay);

// Create a new day tracker
router.post('/', DayTrackerController.createDayTracker);

// Create multiple day trackers (bulk)
router.post('/bulk', DayTrackerController.createBulkDayTrackers);

// Update day tracker
router.put('/:id', DayTrackerController.updateDayTracker);

// Delete day tracker
router.delete('/:id', DayTrackerController.deleteDayTracker);

// Delete all day trackers for a user
router.delete('/user/:userId', DayTrackerController.deleteUserDayTrackers);

// Get all day trackers (admin only)
router.get('/admin/all', DayTrackerController.getAllDayTrackers);

module.exports = router;







