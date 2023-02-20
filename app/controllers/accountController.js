import Services from "../services";
import helpers from "../../config/helpers";

const { Responses } = helpers;

const { AccountService } = Services;

/**
 * @class AccountController
 */
class AccountController {
  /**
   * @static
   * @async
   * @memberof AccountController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async getAccountBalance(req, res) {
    try {
      const user = req.user;
      const accountData = await AccountService.getAccountData(user);
      if (!accountData) {
        return Responses.error(res, {
          data: null,
          message: "Error getting account data!",
          code: 400,
        });
      }
      const { balance } = accountData.AccountData;

      const DOLLAR_FACTOR = 0.0022;
      const naira_balance = balance;
      const dollar_balance = balance * DOLLAR_FACTOR;
      const balances = {
        naira_balance,
        dollar_balance,
      };

      return Responses.success(res, {
        data: balances,
        message: "Balance retrieved!",
      });
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server Error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async getAccountData(req, res) {
    try {
      const user = req.user;
      const accountData = await AccountService.getAccountData(user);
      if (accountData.error) {
        return Responses.error(res, {
          data: accountData.error,
          message: "Error getting account data!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: accountData,
        message: "Account data retrieved!",
      });
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server Error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async getTransactionHistory(req, res) {
    try {
      const user_id = req.user.id;
      const transferHistory = await AccountService.getTransactionHistory(
        user_id
      );
      console.log(transferHistory);
      res.send(transferHistory);
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server Error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async makeTransfer(req, res) {
    try {
      const user_id = req.user.id;
      const transferData = req.transferData;
      const transferMade = await AccountService.makeTransfer(
        transferData,
        user_id
      );
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server Error!",
        code: 500,
      });
    }
  }
}

export default AccountController;
