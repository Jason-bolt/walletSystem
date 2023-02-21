import Schemas from "../db/schema";
import constants from "../../config/constants";

const { DOLLAR_FACTOR } = constants;

const { Account, Funding, Transfer, Transaction } = Schemas;

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
  static async getTransactionHistory(user_id, current_page, limit, filters) {
    try {
      const { transaction_type, start_date, end_date } = filters;

      const page = current_page || 0;
      const type = transaction_type || ["transfer", "funding"];

      const accountData = await Account.findOne({
        user: user_id,
      }).populate("user");

      let query = {
        senderAccount: accountData.accountNumber,
        type,
      };

      if (start_date && end_date) {
        query.createdAt = { $gte: start_date, $lte: end_date };
      }

      const transactionHistory = await Transaction.find(query)
        .limit(limit)
        .skip(page * limit);

      const next_page = await AccountService.checkNextPage(page, limit, query);

      return { transactionHistory, next_page };
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {Number} current_page - Number from the client side, page 1 is 0
   * @param {Number} limit - The number of views to show
   * @param {Object} query - The query object to determine the next page
   * @returns {Promise<Object|Number>}
   */
  static async checkNextPage(current_page, limit, query) {
    try {
      let page = current_page + 1;

      const total_count = await Transaction.find(query).countDocuments();
      console.log("total_count");

      const next_pages = Math.ceil((total_count - page * limit) / limit);

      if (next_pages < 0) {
        return null;
      } else {
        return next_pages;
      }
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
      const { currency, recipientNumber, amount } = transferData;
      const senderAccount = await Account.findOne({ user: user_id });
      const recipientAccount = await Account.findOne({
        accountNumber: recipientNumber,
      });

      let currency_amount = 0;
      if (currency == "naira") {
        currency_amount = amount;
      } else if (currency === "dollar") {
        currency_amount = amount / DOLLAR_FACTOR;
      } else {
        return { error: "Currency must either be 'naira' or 'dollar'!" };
      }

      const newSenderBalance =
        parseInt(senderAccount.balance) - parseInt(currency_amount);
      const newOtherBalance =
        parseInt(recipientAccount.balance) + parseInt(currency_amount);

      const SendUpdated = await Account.updateOne(
        { accountNumber: senderAccount.accountNumber },
        { balance: newSenderBalance }
      );

      if (SendUpdated.acknowledged) {
        const recUpdated = await Account.updateOne(
          { accountNumber: recipientAccount.accountNumber },
          { balance: newOtherBalance }
        );
        if (recUpdated.acknowledged) {
          // await Transfer.create({
          //   currency,
          //   amount,
          //   senderAccount: senderAccount.accountNumber,
          //   recipientAccount: recipientNumber,
          // });
          await Transaction.create({
            currency,
            amount,
            senderAccount: senderAccount.accountNumber,
            recipientAccount: recipientNumber,
            type: "transfer",
          });
          return true;
        } else {
          return { error: "Could not update transfer table!" };
        }
      } else {
        return { error: "Could not update balance!" };
      }
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {Object} fundingData - Data from the client
   * @param {ObjectID} user_id - User ID, instance of mongoose ObjectID
   * @returns {Promise<Object|Boolean>}
   */
  static async fundWallet(fundingData, user_id) {
    try {
      let { currency, amount } = fundingData;
      let currency_amount = 0;
      if (currency === "naira") {
        currency_amount = amount;
      } else if (currency === "dollar") {
        currency_amount = amount / DOLLAR_FACTOR;
      } else {
        return { error: "Currency must either be 'naira' or 'dollar'!" };
      }

      const account = await Account.findOne({ user: user_id });

      const new_balance = account.balance + parseInt(currency_amount);

      const updated = await Account.updateOne(
        { user: user_id },
        { balance: new_balance }
      );

      if (updated.acknowledged) {
        // Add funding data to Funding table
        // await Funding.create({
        //   currency,
        //   amount,
        //   user: user_id,
        // });
        await Transaction.create({
          currency,
          amount,
          senderAccount: account.accountNumber,
          recipientAccount: account.accountNumber,
          type: "funding",
        });
        return true;
      } else {
        return { error: "Could not update account!" };
      }
    } catch (err) {
      return { error: err };
    }
  }
}

export default AccountService;
