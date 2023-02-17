import {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
} from "./userValidation";

const validations = {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
};

export default validations;
