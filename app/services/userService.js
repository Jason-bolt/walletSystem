import Schemas from "../db/schema";
import bcrypt from "bcrypt";
import helpers from "../../config/helpers";

const { EmailHelper } = helpers;

const { User } = Schemas;

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
      console.log("Here");
      const hashed_password = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: hashed_password,
        pin: null,
        otp: 1234, // TODO - Make this unique with speakeasyJs
      });

      const emailSent = await EmailHelper.sendMail({
        email: newUser.email,
        subject: "Registration successful",
        text: "This is a message",
      });
      if (emailSent.error) {
        return { error: emailSent.error };
      }
      return newUser;
    } catch (err) {
      return { error: err };
    }
  }
}

export default UserService;
