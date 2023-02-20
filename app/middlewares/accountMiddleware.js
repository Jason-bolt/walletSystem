import validations from "../validations";
import Responses from "../../config/helpers/responses";
import Schemas from "../db/schema";
import bcrypt from "bcrypt";

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
      const account = await Account.findOne({ user: user_id });
      const newBalance =
        parseInt(account.balance) - parseInt(req.transferData.amount);
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
      const existingPin = await User.findOne({ _id: user_id }, pin);
      const inputedPin = req.transfer.pin;

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
}

export default AccountMiddleware;
