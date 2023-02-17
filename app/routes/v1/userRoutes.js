import { Router } from "express";
import Controllers from "../../controllers";
import middlewares from "../../middlewares";

const { UserMiddleware, AuthMiddleware } = middlewares;
const { UserController } = Controllers;

const router = new Router();

/**
 * @description - Welcome router
 */
router.get("/", (req, res) => {
  res.send("Welcome to wallet system");
});

/**
 * @description - Signup route, generates otp and sends an email to the user
 */
router.post("/signup", [
  UserMiddleware.validateSignUpFields,
  UserMiddleware.uniqueUser,
  UserController.createUser,
]);

/**
 * @description - Verification of otp from user
 */
router.post("/verify_otp", UserController.verifyOtp);

/**
 * @description - Resend OTP
 */
router.post("/resend_otp", UserController.regenerateOtp);

/**
 * @description - Log user in by creating jwt
 */
router.post("/login", [
  UserMiddleware.validateLoginFields,
  UserController.login,
]);

// router.post("/check", [AuthMiddleware.checkJwtToken]);

router.post("/reset-password", [
  UserMiddleware.userExists,
  UserController.sendPasswordResetLink,
]);

router.post("/:user_id/:token", [
  UserMiddleware.validResetPassword,
  UserController.resetPassword,
]);

export default router;
