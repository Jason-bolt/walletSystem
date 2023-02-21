import Services from "../services";
import helpers from "../../config/helpers";
import constants from "../../config/constants";

const { DOLLAR_FACTOR } = constants;

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
      let { page, type, start, end } = req.body;
      const limit = 10;
      const user_id = req.user.id;
      const filters = { transaction_type: type, start_date: start, end_date: end };

      if (start > end) {
        return Responses.error(res, {
          data: null,
          message: "Start date cannot be later than end date!",
          code: 400,
        });
      }

      const transferHistory = await AccountService.getTransactionHistory(
        user_id,
        page,
        limit,
        filters
      );

      // if (transferHistory.error) {
      //   return Responses.error(res, {
      //     data: transferHistory.error,
      //     message: "Error getting transaction history!",
      //     code: 400,
      //   });
      // }

      return Responses.success(res, {
        data: transferHistory,
        message: "Serving transaction history!",
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
  static async makeTransfer(req, res) {
    try {
      const user_id = req.user.id;
      const transferData = req.transferData;
      const transferMade = await AccountService.makeTransfer(
        transferData,
        user_id
      );

      if (transferMade.error) {
        return Responses.error(res, {
          data: transferMade.error,
          message: "Error transferring funds!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: null,
        message: "Transfer made successfully!",
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
  static async fundWallet(req, res) {
    try {
      const user_id = req.user.id;
      const fundingData = req.fundingData;
      const fundingMade = await AccountService.fundWallet(fundingData, user_id);

      if (fundingMade.error) {
        return Responses.error(res, {
          data: fundingMade.error,
          message: "Error Funding wallet!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: null,
        message: "Wallet funded successfully!",
      });
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
