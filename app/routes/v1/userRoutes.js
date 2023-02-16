import { Router } from "express";
import Controllers from "../../controllers";
import middlewares from "../../middlewares";

const { UserMiddleware } = middlewares;
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
  UserMiddleware.validateUser,
  UserMiddleware.uniqueUser,
  UserController.createUser,
]);

/**
 * @description - Verification of otp from user
 */
router.post("/verify_otp", [UserController.verifyOtp]);

export default router;
