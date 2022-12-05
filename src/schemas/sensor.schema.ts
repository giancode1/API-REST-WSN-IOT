import Joi from 'joi';
import { ISensor } from '../libs/models/sensor.model';

const sensorId = Joi.string().alphanum().length(24);
const name = Joi.string().min(3);
const nodeId = Joi.string().alphanum().length(24);

export const getSensorSchema = Joi.object({
  sensorId: sensorId.required(),
});

export const createSensorSchema = Joi.object<ISensor>({
  name: name.required(),
  nodeId: nodeId.required(),
}).options({ allowUnknown: true });

export const updateSensorSchema = Joi.object({
  name,
  nodeId,
}).options({ allowUnknown: true });
