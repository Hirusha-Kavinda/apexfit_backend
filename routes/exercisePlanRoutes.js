const express = require('express');
const router = express.Router();
const ExercisePlanController = require('../controllers/exercisePlanController');
const authMiddleware = require('../middleware/authMiddleware');

// Note: Authentication middleware removed for admin access

// EXISTING ROUTES - Keep as they are
router.post('/', (req, res) => ExercisePlanController.createExercisePlan(req, res));
router.get('/', (req, res) => ExercisePlanController.getUserExercisePlans(req, res));
router.get('/all', (req, res) => ExercisePlanController.getAllExercisePlans(req, res));
router.put('/:id', (req, res) => ExercisePlanController.updateExercisePlan(req, res));
router.delete('/:id', (req, res) => ExercisePlanController.deleteExercisePlan(req, res));
router.get('/:id', (req, res) => ExercisePlanController.getExercisePlanById(req, res));

// NEW ROUTES - Add these for enhanced functionality
// Bulk operations (keep original bulk route, add new upsert route)
router.post('/bulk', (req, res) => ExercisePlanController.createBulkExercisePlans(req, res));
router.post('/bulk/upsert', (req, res) => ExercisePlanController.upsertBulkExercisePlans(req, res));

// User-specific bulk operations
router.delete('/user/:userId', (req, res) => ExercisePlanController.deleteUserExercisePlans(req, res));

module.exports = router;