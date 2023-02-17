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
      const { id } = req.user;
      const balances = await AccountService.getAccountBalance(id);
      if (balances.error) {
        return Responses.error(res, {
          data: balances.error,
          message: "Error getting account balance!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: balances,
        message: "Balanece retrieved!",
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
