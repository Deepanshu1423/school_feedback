const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { checkParentAccess } = require("../middleware/ownershipMiddleware");

router.post("/login", authController.login);
router.post("/register-parent", authController.registerParent);
router.post("/send-register-otp", authController.sendRegisterOtp);
router.post("/verify-register-otp", authController.verifyRegisterOtp);
router.post("/send-forgot-password-otp", authController.sendForgotPasswordOtp);
router.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOtp);
router.post("/reset-password", authController.resetPassword);

// NEW QR QUICK LOGIN ROUTES
router.post("/quick-parent-login/send-otp", authController.sendQuickParentLoginOtp);
router.post("/quick-parent-login/verify-otp", authController.verifyQuickParentLoginOtp);

// CHANGE MOBILE ROUTES
router.post(
  "/profile/:parentId/change-mobile/send-otp",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  authController.sendChangeMobileOtp
);

router.post(
  "/profile/:parentId/change-mobile/verify-otp",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  authController.verifyChangeMobileOtp
);

router.post(
  "/profile/:parentId/change-email/send-otp",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  authController.sendChangeEmailOtp
);

router.post(
  "/profile/:parentId/change-email/verify-otp",
  verifyToken,
  authorizeRoles("Parent", "Admin"),
  checkParentAccess,
  authController.verifyChangeEmailOtp
);

module.exports = router;