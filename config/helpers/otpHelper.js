import bcrypt from "bcrypt";
import Schemas from "../../app/db/schema";

const { Otp } = Schemas;

/**
 * class OtpHelper
 */
class OtpHelper {
  /**
   * @static
   * @returns {Promise<object>}
   */
  static async generate() {
    try {
      const token = Math.floor(Math.random() * 9000 + 1000);
      const string_token = token.toString();
      const hashed_token = await bcrypt.hash(string_token, 10);
      return {
        token,
        hashed_token,
      };
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @param {String} token - This is the raw token inputted y the user
   * @param {String} otp - This is the otp coming from the Otp database
   * @param {ObjectID} user_id - User object id from mongoose instance
   * @returns {Object | Boolean}
   */
  static async verfify(token, otp, user_id) {
    try {
      if (!token) {
        throw Error("Missing token!");
      } else {
        const userOtpRecord = await Otp.findOne({ user_id });
        if (!userOtpRecord) {
          throw Error("Account has already been verified, continue to login");
        } else {
          if (Date.now() > userOtpRecord.expiredAt) {
            throw Error("Token has expired, please request a new one!");
          } else {
            const verified_token = await bcrypt.compare(token, otp);
            if (!verified_token) {
              throw Error("Wrong token passed!");
            } else {
              const deletedOtpRecord = await Otp.deleteMany({ user_id });
              if (deletedOtpRecord) {
                return true;
              }
            }
          }
        }
      }
    } catch (err) {
      return { error: err };
    }
  }
}

export default OtpHelper;
