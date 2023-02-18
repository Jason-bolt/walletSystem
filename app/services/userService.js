import Schemas from "../db/schema";
import bcrypt from "bcrypt";
import helpers from "../../config/helpers";
import jwt from "jsonwebtoken";
import middlewares from "../middlewares";
import crypto from "crypto";

const { AuthMiddleware } = middlewares;

const { EmailHelper, OtpHelper } = helpers;

const { User, Otp, Forgot_Password, Account } = Schemas;

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
   * @memberof UserService
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
   * @memberof UserService
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

  /**
   * @static
   * @async
   * @memberof UserService
   * @param {Object} user - User object containing email and password
   * @returns {Promise<Object>} - Error or tokens
   */
  static async login(user) {
    try {
      const { email, password } = user;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return { error: "Username or password is incorrect!" };
      } else {
        const passwordMatch = await bcrypt.compare(
          password,
          existingUser.password
        );

        if (!passwordMatch) {
          return { error: "Username or password is incorrect!" };
        }

        const data = {
          id: existingUser._id,
          email: existingUser.email,
          phone: existingUser.phone,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        };
        console.log(passwordMatch);
        const jwt_access_token = jwt.sign(data, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_TOKEN_EXPIRY,
        });
        const jwt_refresh_token = jwt.sign(data, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_TOKEN_EXPIRY,
        });

        return {
          access_token: jwt_access_token,
          refresh_token: jwt_refresh_token,
        };
      }
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof UserService
   * @param {Object} user - User object containing email and password
   * @returns {Promise<Object|link>} - Error or tokens
   */
  static async sendPasswordResetLink(user) {
    try {
      let tokenRecord = await Forgot_Password.findOne({ user_id: user._id });

      let token;
      if (tokenRecord) {
        await Forgot_Password.deleteMany({ user_id: user._id });
      }

      token = crypto.randomBytes(32).toString("hex");

      await Forgot_Password.create({
        user_id: user._id,
        token,
      });

      const link = `${process.env.BASE_URL}/${user._id}/${token}`;

      const emailBody = {
        email: user.email,
        subject: "Reset Password Link",
        text: `Reset password with this link: ${link} it will expire in 10 minutes.`,
      };
      const emailSent = await EmailHelper.sendMail(emailBody);

      if (emailSent.error) {
        return { error: emailSent.error };
      }

      return link;
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof UserService
   * @param {Object} data - Contains user_id, token, password
   * @returns {Promise<Object|Boolean>} - Error or true
   */
  static async resetPassword(data) {
    try {
      const { user_id, token, password, confirm_password } = data;

      const hashed_password = await bcrypt.hash(password, 10);

      const updated = await User.updateOne(
        { _id: user_id },
        { password: hashed_password }
      );
      if (updated.acknowledged) {
        const deleted = await Forgot_Password.deleteMany({ user_id, token });

        if (deleted.acknowledged) {
          return true;
        } else {
          return { error: "Could not delete forgot password field!" };
        }
      } else {
        return { error: "Could not update user!" };
      }
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @await
   * @memberof UserService
   * @param {Object} userID - User ID
   * @returns {Promise<Boolean|Object>}
   */
  static async createAccount(userID) {
    try {
      // Create account number
      const accountNumber = Math.floor(
        Math.random() * 90000000000 + 10000000000
      );
      const accountCreated = await Account.create({
        accountNumber,
        user: userID,
      });

      if (accountCreated) {
        return true;
      } else {
        return { error: "Could not create account!" };
      }
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @static
   * @async
   * @memberof UserService
   * @param {Number} pin - User inputed pin code
   * @param {ObjedtID} user_id - User ID, an instance of mongoose ObjiectID
   * @returns {Promise<Object|Boolean>}
   */
  static async createPin(pin, user_id) {
    try {
      const hashed_pin = await bcrypt.hash(pin, 12);

      const existingAccount = await Account.findOne({ user: user_id });
      if (existingAccount) {
        return { error: "Account already created!" };
      }

      const updated = await User.updateOne(
        { _id: user_id },
        { pin: hashed_pin }
      );

      if (updated.acknowledged) {
        const accountCreated = await UserService.createAccount(user_id);
        if (accountCreated.error) {
          return { error: accountCreated.error };
        } else {
          return true;
        }
      } else {
        return { error: "Could not update user pin!" };
      }
    } catch (err) {
      return { error: err };
    }
  }
}

export default UserService;
