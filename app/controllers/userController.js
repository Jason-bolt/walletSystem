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
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
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

  /**
   * @static
   * @async
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async verifyOtp(req, res) {
    try {
      const { user_id, token } = req.body;
      if (!token) {
        Responses.error(res, {
          data: null,
          message: "Token is missing!",
          code: 404,
        });
      }
      if (!user_id) {
        Responses.error(res, {
          data: null,
          message: "User ID is missing!",
          code: 404,
        });
      }
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
    } catch (err) {
      Responses.error(res, { data: err, message: "Server Error!", code: 500 });
    }
  }

  /**
   * @static
   * @async
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async regenerateOtp(req, res) {
    try {
      const { user_id, email } = req.body;
      if (!user_id) {
        return Responses.error(res, {
          data: null,
          message: "User ID is missing!",
          code: 404,
        });
      }
      if (!email) {
        return Responses.error(res, {
          data: null,
          message: "Email is missing!",
          code: 404,
        });
      }
      const newToken = await UserService.regenerateOtp(user_id, email);

      if (newToken.error) {
        return Responses.error(res, {
          data: newToken.error,
          message: "Error sending new token!",
          code: 404,
        });
      }
      return Responses.success(res, {
        data: null,
        message: "New token sent to email!",
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
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async login(req, res) {
    try {
      const tokens = await UserService.login(req.body);
      if (tokens.error) {
        return Responses.error(res, {
          data: tokens.error,
          message: "Error generating tokens!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: tokens,
        message: "User logged in successfully!",
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
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async sendPasswordResetLink(req, res) {
    try {
      const user = req.user;
      const link = await UserService.sendPasswordResetLink(user);

      if (link.error) {
        return Responses.error(res, {
          data: link.error,
          message: "Error sending password reset link!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: link,
        message: "Reset link sent to email!",
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
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async resetPassword(req, res) {
    try {
      const data = req.resetData;
      const password_updated = await UserService.resetPassword(data);

      if (password_updated.error) {
        return Responses.error(res, {
          data: password_updated.error,
          message: "Error resetting password!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: null,
        message: "Password has been reset!",
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
   * @memberof UserController
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @returns {Response} Response
   */
  static async createPin(req, res) {
    try {
      const user_id = req.user.id;
      const pin = req.pin;

      console.log("Here");
      const pinCreated = await UserService.createPin(pin, user_id);

      if (pinCreated.error) {
        return Responses.error(res, {
          data: pinCreated.error,
          message: "Error creating pin!",
          code: 400,
        });
      }

      return Responses.success(res, {
        data: null,
        message: "Pin created, account has been activated!",
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

export default UserController;
