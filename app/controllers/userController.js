import Services from "../services";
import helpers from "../../config/helpers";

const { Responses } = helpers;

const { UserService } = Services;

/**
 * @class UserController
 */
class UserController {
  /**
   * @static
   * @async
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns JSON
   */
  static async createUser(req, res) {
    try {
      const userPayload = req.body;
      const newUser = await UserService.createUser(userPayload);

      if (newUser.error) {
        Responses.error(res, {
          data: newUser.error,
          message: "Error creating user!",
          code: 400,
        });
      } else {
        Responses.success(res, {
          data: newUser,
          message:
            "Account created successfully, check your email for next steps.",
        });
      }
    } catch (err) {
      Responses.error(res, { data: err, message: "Server Error!", code: 500 });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const { user_id, token } = req.body;
      if (!token || !user_id) {
        Responses.error(res, {
          data: null,
          message: "Token or user ID is missing!",
          code: 404,
        });
      } else {
        const tokenVerified = await UserService.verifyOtp(token, user_id);
        if (tokenVerified.error) {
          Responses.error(res, {
            data: tokenVerified.error,
            message: "Error verifying token!",
            code: 400,
          });
        } else {
          Responses.success(res, {
            data: null,
            message: "Account verified successfully!",
          });
        }
      }
    } catch (err) {
      Responses.error(res, { data: err, message: "Server Error!", code: 500 });
    }
  }
}

export default UserController;
