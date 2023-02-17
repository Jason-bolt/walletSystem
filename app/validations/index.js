import {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
} from "./userValidation";

const validations = {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
};

export default validations;
