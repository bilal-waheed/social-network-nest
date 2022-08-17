import * as Joi from 'joi';

const signUpSchema = Joi.object({
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),
  username: Joi.string().min(8).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(15),
});

const loginSchema = Joi.object({
  username: Joi.string().min(8).max(30).required(),
  password: Joi.string().min(6).max(15).required(),
});

export const validateSignUpData = (signUpObject) =>
  signUpSchema.validate(signUpObject);

export const validateLoginData = (loginObject) =>
  loginSchema.validate(loginObject);
