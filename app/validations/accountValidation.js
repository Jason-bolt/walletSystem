import Joi from "joi";

// currency, accountNumber, amount, pin
export const transferSchema = Joi.object({
  currency: Joi.string().required(),
  recipientNumber: Joi.number().required(),
  amount: Joi.number().required(),
  pin: Joi.number().required(),
});
