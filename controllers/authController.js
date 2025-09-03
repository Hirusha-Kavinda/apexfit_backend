const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class AuthController {
  static async register(req, res) {
    try {
      const { firstName, lastName, birthday, email, password, role } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !birthday || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate role
      if (!['USER', 'ADMIN'].includes(role?.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid role. Must be USER or ADMIN' });
      }

      // Validate birthday format
      if (isNaN(Date.parse(birthday))) {
        return res.status(400).json({ message: 'Invalid birthday format' });
      }

      const existingUser = await UserModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.createUser(
        firstName,
        lastName,
        birthday,
        email,
        hashedPassword,
        role
      );

      res.status(201).json({
        message: `${role} registered successfully`,
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
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await UserModel.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token,
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
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  }
}

module.exports = AuthController;