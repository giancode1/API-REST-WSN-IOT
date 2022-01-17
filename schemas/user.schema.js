const Joi = require('joi');

const id =   Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const email = Joi.string().email();
const password = Joi.string().min(5);
const role = Joi.string().min(4).max(5);

const getUserSchema = Joi.object({
  id: id.required()
});

const createUserSchema = Joi.object({
  name: name.required(),
  email: email.required(),
  password: password.required(),
  role: role.required()
});

const updateUserSchema = Joi.object({
  name: name,
  email: email,
  password: password,
});



module.exports = { getUserSchema, createUserSchema, updateUserSchema }
