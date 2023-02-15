/**
 * @class Responses
 */
class Responses {
  /**
   * @static
   * @param {Response} res - This is the response from a controller method
   * @param {Object} param1 - An object carrying the status code, data and message
   * @returns JSON
   */
  static success(res, { data, message, code = 200 }) {
    return res.status(code).json({
      message,
      data,
    });
  }

  /**
   * @static
   * @param {Response} res - This is the response from a controller method
   * @param {Object} param1 - An object carrying the status code, data and message
   * @returns JSON
   */
  static error(res, { data, message, code }) {
    return res.status(code).json({
      message,
      data,
    });
  }
}

export default Responses;
