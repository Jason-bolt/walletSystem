import validations from "../validations";
import Responses from "../../config/helpers/responses";
import Schemas from "../db/schema";
import bcrypt from "bcrypt";
import constants from "../../config/constants";

const { DOLLAR_FACTOR } = constants;
const { Account, User } = Schemas;
const { AccountValidation } = validations;

/**
 * @class AccountMiddleware
 */
class AccountMiddleware {
  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async checkTransferFields(req, res, next) {
    try {
      let { currency, recipientNumber, amount, pin } = req.body;
      amount = parseInt(amount);
      recipientNumber = parseInt(recipientNumber);
      const transferData = { currency, recipientNumber, amount, pin };
      const { error } = AccountValidation.transferSchema.validate(
        transferData,
        { abortEarly: false }
      );
      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "Error validating transfer fields!",
          code: 400,
        });
      }

      req.transferData = transferData;

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async checkFundingFields(req, res, next) {
    try {
      let { currency, amount } = req.body;
      amount = parseInt(amount);

      const fundingData = { currency, amount };
      const { error } = AccountValidation.fundingSchema.validate(fundingData, {
        abortEarly: false,
      });
      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "Error validating funding fields!",
          code: 400,
        });
      }

      req.fundingData = fundingData;

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async checkRecipientExists(req, res, next) {
    try {
      let { recipientNumber } = req.body;
      recipientNumber = parseInt(recipientNumber);
      const recipientAccount = await Account.findOne({
        accountNumber: recipientNumber,
      });

      if (!recipientAccount) {
        return Responses.error(res, {
          data: null,
          message: "Recipient does not exist!",
          code: 400,
        });
      }

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async senderNotRecipient(req, res, next) {
    try {
      let { recipientNumber } = req.body;
      recipientNumber = parseInt(recipientNumber);
      const recipientAccount = await Account.findOne({
        accountNumber: recipientNumber,
      });

      const senderAccount = await Account.findOne({ user: req.user.id });

      if (recipientAccount.accountNumber === senderAccount.accountNumber) {
        return Responses.error(res, {
          data: null,
          message: "Sender cannot be recipient!",
          code: 400,
        });
      }

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async checkBalanceIsEnough(req, res, next) {
    try {
      const user_id = req.user.id;
      const { currency, amount } = req.transferData;

      let currency_amount = 0;

      if (currency === "naira") {
        currency_amount = amount;
      } else if (currency === "dollar") {
        currency_amount = amount / DOLLAR_FACTOR;
      } else {
        return Responses.error(res, {
          data: null,
          message: "Currency must either be 'naira' or 'dollar'!",
          code: 400,
        });
      }

      const account = await Account.findOne({ user: user_id });
      const newBalance = parseInt(account.balance) - currency_amount;

      if (newBalance < 0) {
        return Responses.error(res, {
          data: null,
          message: "Balance is not sufficient to make this transaction!",
          code: 400,
        });
      }
      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async checkPin(req, res, next) {
    try {
      const user_id = req.user.id;
      const currentUser = await User.findOne({ _id: user_id });
      const existingPin = currentUser.pin;
      const inputedPin = req.transferData.pin;

      const pinMatch = await bcrypt.compare(inputedPin, existingPin);

      if (!pinMatch) {
        return Responses.error(res, {
          data: null,
          message: "Pin is incorrect!",
          code: 400,
        });
      }
      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async isAccountActivated(req, res, next) {
    try {
      const user_id = req.user.id;
      const account = await Account.findOne({ user: user_id });

      if (!account) {
        return Responses.error(res, {
          data: null,
          message: "Account not activated, please create a pin!",
          code: 400,
        });
      }

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }
}

export default AccountMiddleware;
