import Joi from 'joi';
import { ISensor } from '../libs/models/sensor.model';
import { objectIdValidator } from './customId';

const name = Joi.string().min(3);
const sensorId = Joi.string().custom(objectIdValidator);
const nodeId = Joi.string().custom(objectIdValidator);

export const getSensorSchema = Joi.object({
  sensorId: sensorId.required(),
});

export const createSensorSchema = Joi.object<ISensor>({
  name: name.required(),
  nodeId: nodeId.required(),
}).options({ allowUnknown: true });

export const updateSensorSchema = Joi.object<Partial<ISensor>>({
  name,
  nodeId,
}).options({ allowUnknown: true });
