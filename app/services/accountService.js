import Schemas from "../db/schema";

const { Account } = Schemas;

/**
 * @class AccountService
 */
class AccountService {
  

  /**
   * @static
   * @async
   * @memberof AccountService
   * @param {ObjectID} user_id - User ID an object of mongoose ObjectID
   * @returns {Promise<Object>}
   */
  static async getAccountBalance(user_id) {
    try {
      const DOLLAR_FACTOR = 0.0022;
      const account = await Account.findOne({ user: user_id });
      if (!account) {
        return { error: "Account could not be retrieved!" };
      }
      let { balance } = account;
      balance = parseInt(balance);
      const naira_balance = balance;
      const dollar_balance = balance * DOLLAR_FACTOR;
      return { naira_balance, dollar_balance };
    } catch (err) {
      return { error: err };
    }
  }
}

export default AccountService;
