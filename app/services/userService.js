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
        return { error: otpObj.error };
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
        text: `Account created, your confirmatory code is ${otpObj.token}. It will expire in 10 minutes.`,
      });
      if (emailSent.error) {
        return { error: emailSent.error };
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

  /**
   * @static
   * @async
   * @param {String} token - Token received from user response
   * @param {ObjectID} user_id - User id of mongoose objectID
   * @returns {Promise<Boolean|Object}
   */
  static async verifyOtp(token, user_id) {
    try {
      const otpRecord = await Otp.findOne({ user_id });
      if (!otpRecord) {
        return {
          error: "Account has already been verified, continue to login",
        };
      } else {
        const tokenVerified = await OtpHelper.verify(token, otpRecord);

        if (tokenVerified.error) {
          console.log("Here");
          return { error: tokenVerified.error };
        } else {
          console.log(user_id);
          const updatedUser = await User.updateOne(
            { _id: user_id },
            { isVerified: true }
          );
          console.log(updatedUser);
          if (!updatedUser.acknowledged) {
            return { error: "Could not update user!" };
          } else {
            return updatedUser.acknowledged;
          }
        }
      }
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @param {ObjectID} user_id - The user id, an instance of mongose ObjectID
   * @param {String} email - Email of the user
   * @returns {Promise<Boolean|Object}
   */
  static async regenerateOtp(user_id, email) {
    try {
      // Deleting existing records in the otp database
      await Otp.deleteMany({ user_id });

      // Generatting account confirmatory otp
      const otpObj = await OtpHelper.generate();

      if (otpObj.error) {
        return { error: otpObj.error };
      } else {
        // Adding the user id and token to otp table
        await Otp.create({
          user_id,
          otp: otpObj.hashed_token,
        });
      }

      // Sending email to user with token
      const emailSent = await EmailHelper.sendMail({
        email,
        subject: "Confirmatory code resent",
        text: `Your new confirmatory code is ${otpObj.token}. It will expire in 10 minutes.`,
      });
      console.log(email);
      if (emailSent.error) {
        return { error: emailSent.error };
      }
      return true;
    } catch (err) {
      return { error: err };
    }
  }
}

export default UserService;
