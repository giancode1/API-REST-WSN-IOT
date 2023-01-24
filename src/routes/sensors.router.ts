import express from 'express';

import SensorService from '../services/sensor.service';
import DataService from '../services/data.service';
import { validatorHandler } from '../middlewares/validator.handler';

import {
  getSensorSchema,
  createSensorSchema,
  updateSensorSchema,
} from '../schemas/sensor.schema';

import passport from 'passport';
import { checkRoles } from '../middlewares/auth.handler';

const router = express.Router();
const service = new SensorService();
const service2 = new DataService();

/**
 * @swagger
 * components:
 *  schemas:
 *    Sensor:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: The unique identifier of the sensor
 *        name:
 *          type: string
 *          description: The name of the user
 *        nodeId:
 *          type: string
 *          description: The id of the node that the sensor belongs to
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the sensor was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the sensor was updated
 *      required:
 *        - name
 *        - nodeId
 *      example:
 *        name: temperature 1
 *        nodeId: 61db682424c63424c4416245
 *        location: "Street 1, City 1"
 *        description: "Sensor of temperature 1"
 *        sensibility: 30
 *
 *    SensorDetails:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: The unique identifier of the sensor
 *        name:
 *          type: string
 *          description: The name of the user
 *        nodeId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *              description: The id of the node
 *            name:
 *              type: string
 *              description: The name of the node
 *            description:
 *              type: string
 *              description: The description of the node
 *            userId:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: The id of the user that created the node
 *                name:
 *                  type: string
 *                  description: The name of the user that created the node
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the sensor was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the sensor was updated
 *      required:
 *        - name
 *        - nodeId
 *      example:
 *        _id: 61db585424b62144c3716247
 *        name: temperature 1
 *        description: Sensor of temperature 1
 *        location: room ceiling
 *        resolution: 1024
 *        time_ms: 5000
 *        sensibility: 30
 *        nodeId: {
 *          "_id": "61cg294676cg9d61c642a33b",
 *          "name": "Nodo 1",
 *          "description": "Descripcion del nodo 1",
 *            "userId": {
 *              "_id": "61db294a76c09052c6dda367",
 *              "name": "Nombre Apellido"
 *          }
 *        }
 *        createdAt: 2022-01-09T21:49:08.255Z
 *        updatedAt: 2022-01-09T21:49:08.255Z
 *
 *  parameters:
 *    sensorId:
 *      in: path
 *      name: sensorId
 *      required: true
 *      schema:
 *        type: string
 *      description: The sensor id
 *
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *
 * security:
 * - bearerAuth: []
 *
 */

/**
 * @swagger
 * tags:
 *  name: Sensors
 *  description: Sensors endpoint
 */

/**
 * @swagger
 * /sensors:
 *  get:
 *    summary: Get all sensors
 *    tags: [Sensors]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: An array of sensors
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Sensor'
 *      401:
 *        description: Unauthorized
 */

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin'),
  async (req, res, next) => {
    try {
      const sensors = await service.find();
      res.json(sensors);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sensors/{id}:
 *  get:
 *    summary: Get sensor by id
 *    tags: [Sensors]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/SensorId'
 *    responses:
 *      200:
 *        description: A sensor with information about its parameters, the node and user to which it belongs
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SensorDetails'
 *      404:
 *        description: Sensor not found
 *
 */

router.get(
  '/:sensorId',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'),
  async (req, res, next) => {
    try {
      const { sensorId } = req.params;
      const sensor = await service.findById(sensorId);
      res.json(sensor);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sensors:
 *  post:
 *    summary: Create new sensor
 *    tags: [Sensors]
 *    requestBody:
 *      description: A sensor object, name and nodeId are required, you can add more sensor fields
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Sensor'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: The sensor has been created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sensor'
 *      400:
 *        description: The sensor has not been created
 */

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(createSensorSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newSensor = await service.create(body);
      res.status(201).json(newSensor);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sensors/{id}:
 *  patch:
 *    summary: Update sensor
 *    tags: [Sensors]
 *    parameters:
 *      - $ref: '#/components/parameters/SensorId'
 *    requestBody:
 *      description: A sensor object, requires a correct SensorId, you can add more fields and update any
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Sensor'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: The sensor has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sensor'
 *      400:
 *        description: The sensor has not been updated
 *
 */

router.patch(
  '/:sensorId',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'),
  validatorHandler(updateSensorSchema, 'body'),
  async (req, res, next) => {
    try {
      const { sensorId } = req.params;
      const body = req.body;
      const sensor = await service.update(sensorId, body);
      res.json(sensor);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sensors/{id}:
 *  delete:
 *    summary: Delete sensor
 *    tags: [Sensors]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/SensorId'
 *    responses:
 *      200:
 *        description: The sensor has been deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: The sensor id
 *              example:
 *                _id: 61955e3fd5b6fb5c10de5fc7
 *      404:
 *        description: Sensor not found
 *
 */

router.delete(
  '/:sensorId',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'),
  async (req, res, next) => {
    try {
      const { sensorId } = req.params;
      await service.delete(sensorId);
      res.status(200).json({ sensorId });
    } catch (error) {
      next(error);
    }
  }
);

// *----------------------DATA---------------------------------
/**
 * @swagger
 * tags:
 *  name: Data
 *  description: Data endpoint
 */

/**
 * @swagger
 * /sensors/{sensorId}/data:
 *  get:
 *    summary: Get all data of a sensor
 *    tags: [Data]
 *    description: All the information of a sensor is presented in an array of data objects, from the most current data to the oldest. In this same query you can put different fields such as limit, offset, query date
 *    parameters:
 *      - $ref: '#/components/parameters/sensorId'
 *      - limit:
 *        name: limit
 *        description: The number of data to be returned
 *        in: query
 *        required: false
 *        type: integer
 *        default: 10
 *      - offset:
 *        name: offset
 *        description: offset
 *        in: query
 *        required: false
 *        type: integer
 *        default: 0
 *      - queryDate:
 *        name: date
 *        description: The date of the data to be returned until the current date
 *        in: query
 *        required: false
 *        type: string
 *        format: yyyy-mm-dd
 *        example: 2022-01-16
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: An array of data of a sensor
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: The data id
 *                  sensorId:
 *                    type: string
 *                    description: The sensor id
 *                  createdAt:
 *                    type: string
 *                    description: The date of the data creation
 *                  updatedAt:
 *                    type: string
 *                    description: The date of the data update
 *                example:
 *                  _id: 61ddf739c1e6e8f5353b3a87
 *                  temperature: 35
 *                  sensorId: 61db585424b62144c3716247
 *                  createdAt: 2022-01-11T21:31:37.922Z
 *                  updatedAt: 2022-01-11T21:31:37.922Z
 *      401:
 *        description: Unauthorized
 */

router.get(
  '/:sensorId/data',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'),
  async (req: any, res, next) => {
    try {
      const { sensorId } = req.params;
      // transform quey params to int
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const date = req.query.date;
      const data = await service2.getDataBySensorId(
        sensorId,
        limit,
        offset,
        date
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sensors/{sensorId}/data:
 *  post:
 *    summary: Create data
 *    tags: [Data]
 *    description: Create data of a sensor
 *    parameters:
 *      - $ref: '#/components/parameters/sensorId'
 *    requestBody:
 *      description: A data object, can be any value of any structure
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              measurement:
 *                type: any
 *                description: The measurement of the data
 *            example:
 *              temperature: 35
 *
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: An array of data of a sensor
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                measurement:
 *                  type: any
 *                  description: The measurement of the data
 *              example:
 *               temperature: 35
 *      401:
 *        description: Unauthorized
 */
router.post(
  '/:sensorId/data',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'), // valido si esta bn el id del sensor
  async (req, res, next) => {
    try {
      const { sensorId } = req.params;
      const body = req.body;
      const newData = await service2.createDataBySensorId(sensorId, body);
      res.status(201).json(newData);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /{sensorId}/data:
 *  delete:
 *    summary: Delete old data of a sensor, limit of data is optional
 *    tags: [Data]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/sensorId'
 *      - limit:
 *        name: limit
 *        description: The number of data to be deleted
 *        in: query
 *        required: false
 *        type: integer
 *        default: 1
 *    responses:
 *      200:
 *        description: The data has been deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: The node id
 *              example:
 *                _id: 61df0bb1d1b9489398db9424
 *      404:
 *        description: Node not found
 *
 */

// borra #limit datos, con entrada sensorId
router.delete(
  '/:sensorId/data',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getSensorSchema, 'params'), // valido si esta bn el id del sensor
  async (req: any, res, next) => {
    try {
      const { sensorId } = req.params;
      const limit = parseInt(req.query.limit) || 1;
      const data = await service2.deleteManyBySensorId(sensorId, limit);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
