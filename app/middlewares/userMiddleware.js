import userValidations from "../validations";

const { userSignUpSchema } = userValidations;

class UserMiddleware {
  static validateUser(req, res, next) {
    try {
      const { error, value } = userSignUpSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return error.details;
      }

      next();
    } catch (err) {
      return err;
    }
  }
}

export default UserMiddleware;
