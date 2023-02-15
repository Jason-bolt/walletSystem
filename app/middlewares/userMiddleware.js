import userValidations from "../validations";

const { userSignUpSchema } = userValidations;

class UserMiddleware {
  static validateUser(req, res, next) {
    // const { error, value } = userSignUpSchema.validate
    try {
      const { error, value } = userSignUpSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        res.status(400).send(error.details);
      }

      next();
    } catch (err) {
      res.status(500).send({ error: err });
    }
  }
}

export default UserMiddleware;
