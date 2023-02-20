import { Router } from "express";
import Controllers from "../../controllers";
import middlewares from "../../middlewares";

const { AccountMiddleware, AuthMiddleware } = middlewares;
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

/**
 * Retrieving all account information
 */
router.post("/get-account-data", [
  AuthMiddleware.auth,
  AccountController.getAccountData,
]);

/**
 * Retrieving transaction history
 */
router.post("/get-transaction-history", [
  AuthMiddleware.auth,
  AccountController.getTransactionHistory, // Get back to it later
]);

/**
 * Make transaction
 */
router.post("/make-transfer", [
  AuthMiddleware.auth,
  AccountMiddleware.checkTransferFields,
  AccountMiddleware.checkRecipientExists,
  AccountMiddleware.checkBalanceIsEnough,
  AccountMiddleware.checkPin,
  AccountController.makeTransfer, // Come back to this after making deposit
]);

export default router;