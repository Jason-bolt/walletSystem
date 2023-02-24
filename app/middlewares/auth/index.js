import jwt from 'jsonwebtoken';
import Responses from '../../../config/helpers/responses';

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
  static async auth(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return Responses.error(res, {
          data: null,
          message: 'Token is missing!',
          code: 404,
        });
      }
      const token = authorization.split(' ')[1];

      let error = {};
      jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          error = { error: err };
        } else {
          req.user = data;
        }
      });

      if (error.error) {
        return Responses.error(res, {
          data: error,
          message: 'Token is incorrect or expired!',
          code: 400,
        });
      }
      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: 'Server error!',
        code: 500,
      });
    }
  }

  /**
   * @static
   * @async
   * @memberof AuthMiddleware
   * @param {Request} req - The request from the endpoint
   * @param {Response} res - The response from the method
   * @param {Next} next - callback function that runs when middleware method ends
   * @returns {Promise<Response|next>}
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return Responses.error(res, {
          data: null,
          message: 'Refresh token is missing!',
          code: 400,
        });
      }

      const user = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (!user) {
        return Responses.error(res, {
          data: null,
          message: 'Token is incorrect or expired!',
          code: 400,
        });
      }

      const newAccessToken = jwt.sign(user, 'secret', {
        expiresIn: '1h',
      });

      req.user = user;

      next();
    } catch (err) {
      return Responses.error(res, {
        data: err,
        message: 'Server error!',
        code: 500,
      });
    }
  }
}

export default AuthMiddleware;
