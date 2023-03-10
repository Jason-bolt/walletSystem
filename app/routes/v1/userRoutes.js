import { Router } from 'express';
import Controllers from '../../controllers';
import middlewares from '../../middlewares';

const { UserMiddleware, AuthMiddleware } = middlewares;
const { UserController } = Controllers;

const router = new Router();

/**
 * @description - Welcome router
 */
router.get('/', (req, res) => {
  res.status(200).send('Welcome to wallet system');
});

/**
 * @description - Signup route, generates otp and sends an email to the user
 */
router.post('/signup', [
  UserMiddleware.validateSignUpFields,
  UserMiddleware.uniqueUser,
  UserController.createUser
]);

/**
 * @description - Verification of otp from user
 */
router.post('/verify_otp', UserController.verifyOtp);

/**
 * @description - Resend OTP
 */
router.post('/resend_otp', [UserMiddleware.isIdForEmail, UserController.regenerateOtp]);

/**
 * @description - Log user in by creating jwt
 */
router.post('/login', [UserMiddleware.validateLoginFields, UserController.login]);

/**
 * @description - Ruote to reset password
 */
router.post('/reset-password', [UserMiddleware.userExists, UserController.sendPasswordResetLink]);

/**
 * @description - Route to change password
 * @param {String} user_id - User ID
 * @param {String} token - Token to ensure uniqueness and validity of request
 */
router.patch('/:user_id/:token', [UserMiddleware.validResetPassword, UserController.resetPassword]);

/**
 *
 * AUTH ROUTES
 *
 * User must be logged in to reach these routes
 */
router.post('/create-pin', [
  AuthMiddleware.auth,
  UserMiddleware.validPin,
  UserController.createPin
]);

export default router;
