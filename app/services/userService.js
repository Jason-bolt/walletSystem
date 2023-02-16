import Schemas from "../db/schema";
import bcrypt from "bcrypt";
import helpers from "../../config/helpers";

const { EmailHelper, OtpHelper } = helpers;

const { User, Otp } = Schemas;

/**
 * @class UserService
 */
class UserService {
  /**
   * @static
   * @async
   * @memberof UserService
   * @param {Object} user - This containes the fields sent in by the user
   * @returns {Promise<object>} - A promise of a user object or error object
   */
  static async createUser(user) {
    try {
      const { firstName, lastName, email, phone, password } = user;
      const hashed_password = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: hashed_password,
        pin: null,
      });

      // Generatting account confirmatory otp
      const otpObj = await OtpHelper.generate();

      if (otpObj.error) {
        console.log(otpObj);
        throw Error(otpObj.error);
      } else {
        // Adding the user id and token to otp table
        await Otp.create({
          user_id: newUser._id,
          otp: otpObj.hashed_token,
        });
      }

      // Sending email to user with token
      const emailSent = await EmailHelper.sendMail({
        email: newUser.email,
        subject: "Registration successful",
        text: `Account created, your confirmatory code is ${otpObj.token}`,
      });
      if (emailSent.error) {
        throw Error(emailSent.error);
      }

      const userObj = {
        id: newUser._id,
        email: newUser.email,
      };
      return { userObj };
    } catch (err) {
      return { error: err };
    }
  }
}

export default UserService;
