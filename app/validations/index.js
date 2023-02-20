import {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
} from "./userValidation";

import { transferSchema, fundingSchema } from "./accountValidation";

const UserValidation = {
  userSignUpSchema,
  userLoginSchema,
  emailSchema,
  passwordResetSchema,
  pinSchema,
};

const AccountValidation = {
  transferSchema,
  fundingSchema,
};

const validations = {
  UserValidation,
  AccountValidation,
};

export default validations;
