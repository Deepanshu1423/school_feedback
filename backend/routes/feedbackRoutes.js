const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { checkParentAccess } = require("../middleware/ownershipMiddleware");

router.post(
  "/submit",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  feedbackController.submitFeedback
);

module.exports = router;