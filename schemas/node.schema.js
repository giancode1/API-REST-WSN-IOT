const Joi = require('joi');

const id = Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const userId = Joi.string().alphanum().length(24);
const description = Joi.string();

const getNodeSchema = Joi.object({
  id: id.required()
});

const createNodeSchema = Joi.object({
  name: name.required(),
  userId: userId.required(),
  description: description.required(),
}).options({ allowUnknown: true });

const updateNodeSchema = Joi.object({
  name: name,
  description,
}).options({ allowUnknown: true });

module.exports = { getNodeSchema, createNodeSchema, updateNodeSchema  }