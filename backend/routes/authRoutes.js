const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

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

module.exports = router;