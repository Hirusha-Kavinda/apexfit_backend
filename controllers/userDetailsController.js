const UserDetailsModel = require('../models/userDetailsModel');

class UserDetailsController {
  // Create
  static async createUserDetails(req, res) {
    try {
      const { userId, age, height, weight, daysPerWeek, gender, fitnessLevel, medicalCondition, goal } = req.body;

      // Validate required fields
      if (!userId || !age || !height || !weight || !daysPerWeek || !gender || !fitnessLevel || !goal) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          required: ["userId", "age", "height", "weight", "daysPerWeek", "gender", "fitnessLevel", "goal"],
          received: { userId, age, height, weight, daysPerWeek, gender, fitnessLevel, medicalCondition, goal }
        });
      }

      console.log("Creating user details with data:", { userId, age, height, weight, daysPerWeek, gender, fitnessLevel, medicalCondition, goal });

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
      
      // Provide more specific error messages
      if (error.code === 'P2002') {
        res.status(400).json({ error: "User details already exist for this user" });
      } else if (error.code === 'P2003') {
        res.status(400).json({ error: "User not found. Please check if the user exists." });
      } else {
        res.status(500).json({ 
          error: "Failed to create user details", 
          details: error.message,
          code: error.code 
        });
      }
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

  // Get by userId (all versions)
  static async getUserDetailsByUser(req, res) {
    try {
      const { userId } = req.params;
      const details = await UserDetailsModel.getAllUserDetailsByUser(userId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  }

  // Get current user details by userId
  static async getCurrentUserDetailsByUser(req, res) {
    try {
      const { userId } = req.params;
      const details = await UserDetailsModel.getCurrentUserDetailsByUser(userId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current user details" });
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
