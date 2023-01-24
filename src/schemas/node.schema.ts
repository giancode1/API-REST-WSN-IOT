import Joi from 'joi';
import { INode } from '../libs/models/node.model';
import { objectIdValidator } from './customId';

const name = Joi.string().min(3);
const id = Joi.string().custom(objectIdValidator);
const userId = Joi.string().custom(objectIdValidator);
const description = Joi.string();

export const getNodeSchema = Joi.object({
  id: id.required(),
});

export const createNodeSchema = Joi.object<INode>({
  name: name.required(),
  userId: userId.required(),
  description: description.required(),
}).options({ allowUnknown: true });

export const updateNodeSchema = Joi.object<Partial<INode>>({
  name,
  description,
}).options({ allowUnknown: true });
