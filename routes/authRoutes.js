const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');

// Wrap static methods in arrow functions for Express compatibility
router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));

// Route to get all users (no auth required)
router.get('/users', (req, res) => AuthController.getAllUsers(req, res));

// Protected routes
router.get('/admin/profile', authMiddleware('ADMIN'), async (req, res) => {
  try {
    const user = await UserModel.findUserByEmail(req.user.email);
    res.json({
      message: 'Admin protected route',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

router.get('/user/profile', authMiddleware('USER'), async (req, res) => {
  try {
    const user = await UserModel.findUserByEmail(req.user.email);
    res.json({
      message: 'User protected route',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;