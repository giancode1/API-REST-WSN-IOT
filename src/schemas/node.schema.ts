import Joi from 'joi';
import { INode } from '../libs/models/node.model';

const id = Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const userId = Joi.string().alphanum().length(24);
const description = Joi.string();

export const getNodeSchema = Joi.object({
  id: id.required(),
});

export const createNodeSchema = Joi.object<INode>({
  name: name.required(),
  userId: userId.required(),
  description: description.required(),
}).options({ allowUnknown: true });

export const updateNodeSchema = Joi.object({
  name,
  description,
}).options({ allowUnknown: true });
