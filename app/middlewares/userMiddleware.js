import userValidations from "../validations";
import Responses from "../../config/helpers/responses";
import Schemas from "../db/schema";

const { User, Forgot_Password } = Schemas;

const { userSignUpSchema, userLoginSchema, emailSchema, passwordResetSchema } =
  userValidations;

/**
 * @class UserMiddleware
 */
class UserMiddleware {
  /**
   * @static
   * @async
   * @memberof UserMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static async uniqueUser(req, res, next) {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email: email }).exec();

      if (user) {
        return Responses.error(res, {
          data: null,
          message: "User already exists!",
          code: 400,
        });
      } else {
        next();
      }
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
   * @memberof UserMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static validateSignUpFields(req, res, next) {
    try {
      const { error } = userSignUpSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "Signup validation errors!",
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
   * @memberof UserMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static async validateLoginFields(req, res, next) {
    try {
      const { error } = userLoginSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "Login validation errors!",
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
   * @memberof UserMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static async userExists(req, res, next) {
    try {
      const { error } = emailSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "Email is missing!",
          code: 404,
        });
      }
      const email = req.body.email;

      const user = await User.findOne({ email });
      if (!user) {
        return Responses.error(res, {
          data: null,
          message: "User does not exist!",
          code: 400,
        });
      }

      req.user = user;

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: "Server error!",
        code: 500,
      });
    }
  }

  static async validResetPassword(req, res, next) {
    try {
      const { user_id, token } = req.params;
      const { password, confirm_password } = req.body;
      const data = { user_id, token, password, confirm_password };

      const { error } = passwordResetSchema.validate(data, {
        abortEarly: false,
      });

      if (error) {
        return Responses.error(res, {
          data: error.details,
          message: "All fields are required!",
          code: 404,
        });
      }

      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return Responses.error(res, {
          data: null,
          message: "User does not exist!",
          code: 404,
        });
      }

      const forgotPasswordRecord = await Forgot_Password.findOne({
        user_id,
        token,
      });

      if (!forgotPasswordRecord) {
        return Responses.error(res, {
          data: null,
          message: "Token is invalid!",
          code: 400,
        });
      }

      if (Date.now() > forgotPasswordRecord.expireAt) {
        return Responses.error(res, {
          data: null,
          message: "Link expired!",
          code: 404,
        });
      }

      req.resetData = data;
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

export default UserMiddleware;
