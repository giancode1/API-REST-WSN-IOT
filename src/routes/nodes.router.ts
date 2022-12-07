import express from 'express';

import NodeService from '../services/node.service';
import { validatorHandler } from '../middlewares/validator.handler';

import {
  getNodeSchema,
  createNodeSchema,
  updateNodeSchema,
} from '../schemas/node.schema';

import passport from 'passport';
import { checkRoles } from '../middlewares/auth.handler';

const router = express.Router();
const service = new NodeService();
/**
 * @swagger
 * components:
 *  schemas:
 *    Node:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: the id of the node
 *        name:
 *          type: string
 *          description: The name of the node
 *        description:
 *          type: string
 *          description: The description of the node
 *        userId:
 *          type: string
 *          description: The id of the user that created the node
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the node was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the node was updated
 *      required:
 *        - name
 *        - userId
 *        - description
 *      example:
 *        name: Nodo 1
 *        description: Descripcion del nodo 1
 *        userId: 61cf296a994060f2c6ega2c5
 *
 *    NodeDetails:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: the id of the node
 *        name:
 *          type: string
 *          description: The name of the node
 *        description:
 *          type: boolean
 *          description: The description of the node
 *        userId:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *              description: The id of the user that created the node
 *            name:
 *              type: string
 *              description: The name of the user that created the node
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the node was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the node was updated
 *        sensors:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: The id of the sensor
 *              name:
 *                type: string
 *                description: The name of the sensor
 *              description:
 *                type: string
 *                description: The description of the sensor
 *      example:
 *        _id: 61cg294676cg9d61c642a33b
 *        name: Nodo 1
 *        description: Descripcion del nodo 1
 *        userId: 61cf296a994060f2c6ega2c5
 *        createdAt: 2022-01-01T00:00:00.000Z
 *        updatedAt: 2022-01-01T00:00:00.000Z
 *        sensors: [{id: "1", name: "humedad"}, {id: "2", name: "temperatura", description: "sensor de temperatura alta"}]
 *
 *  parameters:
 *    NodeId:
 *      in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *      description: The node id
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
 *  name: Nodes
 *  description: Nodes endpoint
 */

/**
 * @swagger
 * /nodes:
 *  get:
 *    summary: Get all nodes
 *    tags: [Nodes]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: totalNodes and an array of nodes
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Node'
 *      401:
 *        description: Unauthorized
 *
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin'),
  async (req, res, next) => {
    try {
      const nodes = await service.find();
      res.json(nodes);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /nodes/{id}:
 *  get:
 *    summary: Get node by id
 *    tags: [Nodes]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/NodeId'
 *    responses:
 *      200:
 *        description: A node with all your information, and all the sensors of the node with id and name
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NodeDetails'
 *      404:
 *        description: Node not found
 *
 */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getNodeSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const node = await service.findById(id);
      res.json(node);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /nodes:
 *  post:
 *    summary: Create new node
 *    tags: [Nodes]
 *    requestBody:
 *      description: A node object, you can add more fields
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Node'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: The node has been created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Node'
 *      400:
 *        description: The user has not been created
 *
 */

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(createNodeSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newNode = await service.create(body);
      res.status(201).json(newNode);
    } catch (error) {
      next(error);
    }
  }
);
/**
 * @swagger
 * /nodes/{id}:
 *  patch:
 *    summary: Update node
 *    tags: [Nodes]
 *    parameters:
 *      - $ref: '#/components/parameters/NodeId'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Node'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: The node has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Node'
 *      400:
 *        description: The user has not been updated
 *
 */
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getNodeSchema, 'params'),
  validatorHandler(updateNodeSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const node = await service.update(id, body);
      res.json(node);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /nodes/{id}:
 *  delete:
 *    summary: Delete node
 *    tags: [Nodes]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/NodeId'
 *    responses:
 *      200:
 *        description: The node has been deleted
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
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'user'),
  validatorHandler(getNodeSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(200).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
