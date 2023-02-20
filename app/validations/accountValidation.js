import Joi from "joi";

export const transferSchema = Joi.object({
  currency: Joi.string().required(),
  recipientNumber: Joi.number().required(),
  amount: Joi.number().required(),
  pin: Joi.number().required(),
});

export const fundingSchema = Joi.object({
  currency: Joi.string().required(),
  amount: Joi.number().required(),
});
