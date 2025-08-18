const UserDetailsModel = require('../models/userDetailsModel');

class UserDetailsController {
  // Create
  static async createUserDetails(req, res) {
    try {
      const { userId, age, height, weight, daysPerWeek, gender, fitnessLevel, medicalCondition, goal } = req.body;

      const userDetails = await UserDetailsModel.createUserDetails(
        userId,
        age,
        height,
        weight,
        daysPerWeek,
        gender,
        fitnessLevel,
        medicalCondition,
        goal
      );

      res.status(201).json(userDetails);
    } catch (error) {
      console.error("Error creating user details:", error);
      res.status(500).json({ error: "Failed to create user details" });
    }
  }

  // Get all
  static async getAllUserDetails(req, res) {
    try {
      const details = await UserDetailsModel.getAllUserDetails();
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  }

  // Get by userId
  static async getUserDetailsByUser(req, res) {
    try {
      const { userId } = req.params;
      const details = await UserDetailsModel.getUserDetailsByUser(userId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  }

  // Get by ID
  static async getUserDetailsById(req, res) {
    try {
      const { id } = req.params;
      const details = await UserDetailsModel.getUserDetailsById(id);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  }

  // Update
  static async updateUserDetails(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await UserDetailsModel.updateUserDetails(id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user details" });
    }
  }

  // Delete
  static async deleteUserDetails(req, res) {
    try {
      const { id } = req.params;
      await UserDetailsModel.deleteUserDetails(id);
      res.json({ message: "User details deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user details" });
    }
  }
}

module.exports = UserDetailsController;
