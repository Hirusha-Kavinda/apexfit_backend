const express = require("express");
const UserDetailsController = require("../controllers/userDetailsController");

const router = express.Router();

// Routes - No authentication required
router.post("/", UserDetailsController.createUserDetails);
router.get("/", UserDetailsController.getAllUserDetails);
router.get("/user/:userId", UserDetailsController.getUserDetailsByUser);
router.get("/user/:userId/current", UserDetailsController.getCurrentUserDetailsByUser);
router.get("/:id", UserDetailsController.getUserDetailsById);
router.put("/:id", UserDetailsController.updateUserDetails);
router.delete("/:id", UserDetailsController.deleteUserDetails);

module.exports = router;
