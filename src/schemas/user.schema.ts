import Joi from 'joi';
import { IUser } from '../libs/models/user.model';

const id = Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const email = Joi.string().email();
const password = Joi.string().min(5);
const role = Joi.string().min(4).max(5);

export const getUserSchema = Joi.object({
  id: id.required(),
});

export const createUserSchema = Joi.object<IUser>({
  name: name.required(),
  email: email.required(),
  password: password.required(),
  role: role.required(),
});

export const updateUserSchema = Joi.object({
  // si mandas un campo ajeno a estos, no hace el cambio y da log error
  // puedes cambiar cualquier de estos campos:
  // name:name
  name,
  email,
  password,
});
