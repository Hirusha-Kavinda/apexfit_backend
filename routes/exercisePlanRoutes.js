const express = require('express');
const router = express.Router();
const ExercisePlanController = require('../controllers/exercisePlanController');
const authMiddleware = require('../middleware/authMiddleware');

// ExercisePlan CRUD routes
router.post('/',  (req, res) => ExercisePlanController.createExercisePlan(req, res));
router.get('/',  (req, res) => ExercisePlanController.getUserExercisePlans(req, res));
router.get('/all', (req, res) => ExercisePlanController.getAllExercisePlans(req, res));
router.put('/:id', (req, res) => ExercisePlanController.updateExercisePlan(req, res));
router.delete('/:id', (req, res) => ExercisePlanController.deleteExercisePlan(req, res));
router.get('/:id', (req, res) => ExercisePlanController.getExercisePlanById(req, res));

module.exports = router;