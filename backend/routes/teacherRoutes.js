const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { checkTeacherAccess } = require("../middleware/ownershipMiddleware");

router.get(
  "/feedbacks/:teacherId",
  verifyToken,
  authorizeRoles("Teacher", "Admin"),
  checkTeacherAccess,
  teacherController.getTeacherFeedbacks
);

router.put(
  "/respond",
  verifyToken,
  authorizeRoles("Teacher", "Admin"),
  checkTeacherAccess,
  teacherController.respondToFeedback
);

router.get(
  "/dashboard-summary/:teacherId",
  verifyToken,
  authorizeRoles("Teacher", "Admin"),
  checkTeacherAccess,
  teacherController.getTeacherDashboardSummary
);

module.exports = router;