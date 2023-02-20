import {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
} from "./userValidation";

import { transferSchema } from "./accountValidation";

const UserValidation = {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
};

const AccountValidation = {
  transferSchema,
};

const validations = {
  UserValidation,
  AccountValidation,
};

export default validations;
