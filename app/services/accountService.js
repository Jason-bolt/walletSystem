import Schemas from "../db/schema";

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
      const { id, email, phone, firstName, lastName } = user;
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
      const { currency, recipientAccount, amount, pin } = transferData;
      const senderAccount = await Account.findOne({ user: user_id });
      const othertAccount = await Account.findOne({
        accountNumber: recipientAccount,
      });

      const newSenderBalance =
        parseInt(senderAccount.balance) - parseInt(amount);
      const newOtherBalance = parseInt(otherAccount.balance) + parseInt(amount);

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
