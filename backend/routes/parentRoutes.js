const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { checkParentAccess } = require("../middleware/ownershipMiddleware");

router.get(
  "/dashboard/:parentId",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  parentController.getParentDashboard
);

router.get(
  "/feedback-history/:parentId",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  parentController.getParentFeedbackHistory
);

router.get(
  "/dropdown-data/:parentId",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  parentController.getParentDropdownData
);
router.get(
  "/student-dashboard/:parentId/:studentId",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  parentController.getParentStudentDashboard
);
module.exports = router;