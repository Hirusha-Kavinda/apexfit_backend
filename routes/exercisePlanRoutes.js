const express = require('express');
const router = express.Router();
const ExercisePlanController = require('../controllers/exercisePlanController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes that require authentication (user-specific operations)
router.post('/', authMiddleware, (req, res) => ExercisePlanController.createExercisePlan(req, res));
router.get('/', authMiddleware, (req, res) => ExercisePlanController.getUserExercisePlans(req, res));
router.put('/:id', authMiddleware, (req, res) => ExercisePlanController.updateExercisePlan(req, res));
router.delete('/:id', authMiddleware, (req, res) => ExercisePlanController.deleteExercisePlan(req, res));
router.get('/:id', authMiddleware, (req, res) => ExercisePlanController.getExercisePlanById(req, res));

// Routes that don't require authentication (admin operations)
router.get('/all', (req, res) => ExercisePlanController.getAllExercisePlans(req, res));

// NEW ROUTES - Add these for enhanced functionality
// Bulk operations (keep original bulk route, add new upsert route)
router.post('/bulk', (req, res) => ExercisePlanController.createBulkExercisePlans(req, res));
router.post('/bulk/upsert', (req, res) => ExercisePlanController.upsertBulkExercisePlans(req, res));

// User-specific bulk operations
router.delete('/user/:userId', (req, res) => ExercisePlanController.deleteUserExercisePlans(req, res));

module.exports = router;