const Joi = require('joi');

const sensorId = Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const nodeId = Joi.string().alphanum().length(24);

const getSensorSchema = Joi.object({
  sensorId: sensorId.required()
});

const createSensorSchema = Joi.object({
  name: name.required(),
  nodeId: nodeId.required(),
}).options({ allowUnknown: true });

const updateSensorSchema = Joi.object({
  name: name,
  nodeId,
}).options({ allowUnknown: true });

module.exports = { getSensorSchema, createSensorSchema, updateSensorSchema }
