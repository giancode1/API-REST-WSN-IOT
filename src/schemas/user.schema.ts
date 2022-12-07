import Joi from 'joi';
import { IUser } from '../libs/models/user.model';
import { createObjectIdValidator } from './customId';

const id = Joi.string().custom(createObjectIdValidator);
const name = Joi.string().min(3);
const email = Joi.string().email();
const password = Joi.string().min(5);
const role = Joi.string().valid('user', 'admin').default('user');
const enabled = Joi.boolean().default(true);

export const getUserSchema = Joi.object({
  id: id.required(),
});

export const createUserSchema = Joi.object<IUser>({
  name: name.required(),
  email: email.required(),
  password: password.required(),
  role: role.required(),
  enabled,
});

export const updateUserSchema = Joi.object<Partial<IUser>>({
  // si mandas un campo ajeno a estos, no hace el cambio y da log error
  // puedes cambiar cualquier de estos campos:
  // name:name
  name,
  email,
  password,
});
