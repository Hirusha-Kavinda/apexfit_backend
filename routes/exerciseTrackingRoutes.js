const express = require('express');
const router = express.Router();
const {
  getUserExercisePlan,
  markExerciseComplete,
  getWeeklyProgress
} = require('../controllers/exerciseTrackingController');

// Get user's exercise plan with tracking data
router.get('/user/:userId/plan', getUserExercisePlan);

// Mark exercise as complete
router.post('/complete', markExerciseComplete);

// Get weekly progress
router.get('/user/:userId/progress', getWeeklyProgress);

module.exports = router;









