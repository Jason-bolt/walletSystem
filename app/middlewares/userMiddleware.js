import userValidations from "../validations";
import Responses from "../../config/helpers/responses";
import User from "../db/schema/User";

const { userSignUpSchema } = userValidations;

/**
 * @class UserMiddleware
 */
class UserMiddleware {
  /**
   * @static
   * @async
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static async uniqueUser(req, res, next) {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email: email }).exec();

      if (user) {
        Responses.error(res, {
          data: null,
          message: "User already exists!",
          code: 400,
        });
      } else {
        next();
      }
    } catch (err) {
      Responses.error(res, { data: err, message: "Server error!", code: 500 });
    }
  }

  /**
   * @static
   * @async
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static validateUser(req, res, next) {
    try {
      const { error, value } = userSignUpSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        Responses.error(res, {
          data: error.details,
          message: "Validation errors!",
          code: 400,
        });
      }

      next();
    } catch (err) {
      Responses.error(res, { data: err, message: "Server error!", code: 500 });
    }
  }
}

export default UserMiddleware;