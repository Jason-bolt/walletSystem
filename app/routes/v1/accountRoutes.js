import { Router } from "express";
import Controllers from "../../controllers";
import middlewares from "../../middlewares";

const { AuthMiddleware } = middlewares;
const { AccountController } = Controllers;

const router = new Router();


/**
 *
 * AUTH ROUTES
 *
 */

/**
 * Retrieving account balance
 */
router.post("/get-balance", [
  AuthMiddleware.auth,
  AccountController.getAccountBalance,
]);

router.post("/transaction-history", [
  AuthMiddleware.auth,
])

export default router;
