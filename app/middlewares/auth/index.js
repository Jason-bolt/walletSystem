import jwt from "jsonwebtoken";
import Responses from "../../../config/helpers/responses";
import bcrypt from "bcrypt";

/**
 * @class AuthMiddleware
 */
class AuthMiddleware {
  /**
   * @static
   * @async
   * @memberof AuthMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   */
  static async checkJwtToken(req, res, next) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return Responses.error(res, {
          data: null,
          message: "Token is missing!",
          code: 404,
        });
      }
      const token = authorization.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          return Responses.error(res, {
            data: err,
            message: "Token is incorrect or expired!",
            code: 400,
          });
        }
        console.log(data);
        req.user = data;
      });
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

export default AuthMiddleware;
