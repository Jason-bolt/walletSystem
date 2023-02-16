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
   * @param {Object} otpRecord - This is the otpRecord for the user
   * @param {ObjectID} user_id - User object id from mongoose instance
   * @returns {Object | Boolean}
   */
  static async verify(token, otpRecord) {
    try {
      if (Date.now() > otpRecord.expiredAt) {
        return { error: "Token has expired, please request a new one!" };
      } else {
        const verified_token = await bcrypt.compare(token, otpRecord.otp);
        if (!verified_token) {
          return { error: "Wrong token passed!" };
        } else {
          const deletedOtpRecord = await Otp.deleteMany({
            user_id: otpRecord.user_id,
          });
          if (deletedOtpRecord) {
            return true;
          }
        }
      }
    } catch (err) {
      return { error: err };
    }
  }
}

export default OtpHelper;
