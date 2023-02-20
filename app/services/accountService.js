import Schemas from "../db/schema";
import constants from "../../config/constants";

const { DOLLAR_FACTOR } = constants;

const { Account, Funding, Transfer } = Schemas;

/**
 * @class AccountService
 */
class AccountService {
  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {Object} user - User object in the token
   * @returns {Promise<Object>}
   */
  static async getAccountData(user) {
    try {
      const { id } = user;
      const account = await Account.findOne({ user: id });
      if (!account) {
        return { error: "Account could not be retrieved!" };
      }

      const { _id, accountNumber, balance } = account;

      return {
        AccountData: {
          id: _id,
          accountNumber,
          balance,
        },
        user: user,
      };
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {ObjectID} user_id - User id, instance of mongoose ObjectID
   * @returns {Promise<Object>}
   */
  static async getTransactionHistory(user_id) {
    try {
      const accountData = await Account.findOne({ user: user_id }).populate(
        "user"
      );
      const fundingData = await Funding.find({ user: user_id });
      const transferData = await Transfer.find({
        senderAccount: accountData.accountNumber,
      });

      return { ...fundingData, ...transferData };
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {Object} transferData - Information coming from the client side
   * @param {ObjectID} user_id - User id, instance of mongoose ObjectID
   * @returns {Promise<Object|Boolean>}
   */
  static async makeTransfer(transferData, user_id) {
    try {
      const { currency, recipientAccount, amount } = transferData;
      const senderAccount = await Account.findOne({ user: user_id });
      const otherAccount = await Account.findOne({
        accountNumber: recipientAccount,
      });

      let currency_amount = 0;
      if (currency == "naira") {
        currency_amount = amount;
      } else {
        currency_amount = amount / DOLLAR_FACTOR;
      }

      const newSenderBalance =
        parseInt(senderAccount.balance) - parseInt(currency_amount);
      const newOtherBalance = parseInt(otherAccount.balance) + parseInt(currency_amount);

      const SendUpdated = await Account.updateOne(
        { accountNumber: senderAccount.accountNumber },
        { balance: newSenderBalance }
      );

      if (SendUpdated.acknowledged) {
        const recUpdated = await Account.updateOne(
          { accountNumber: otherAccount.accountNumber },
          { balance: newOtherBalance }
        );
        return recUpdated.acknowledged;
      } else {
        return { error: "Could not update balance!" };
      }
    } catch (err) {
      return { error: err };
    }
  }
}

export default AccountService;
