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
}

export default AccountService;
