const express = require('express');

const UserService = require('./../services/user.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { getUserSchema, createUserSchema, updateUserSchema  } = require('./../schemas/user.schema');
const passport = require('passport');
const { checkRoles } = require('./../middlewares/auth.handler');

const router = express.Router();
const service = new UserService();

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: The unique identifier of the user
 *        name:
 *          type: string
 *          description: The name of the user
 *        email:
 *          type: string
 *          description: The email of the user
 *        password:
 *          type: string
 *          description: The password of the user
 *        enabled:
 *          type: boolean
 *          description: The enabled of the user
 *        role:
 *          type: string
 *          description: The role of the user
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the user was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the user was updated
 *      required:
 *        - name
 *        - email
 *        - password
 *        - role
 *      example:
 *        name: Nombre Apellido
 *        email: the@email.com
 *        role: user
 *        password: "nombre12345"
 * 
 * 
 *    UserDetails:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: The unique identifier of the user
 *        name:
 *          type: string
 *          description: The name of the user
 *        email:
 *          type: string
 *          description: The email of the user
 *        password:
 *          type: string
 *          description: The password of the user
 *        enabled:
 *          type: boolean
 *          description: The enabled of the user
 *        role:
 *          type: string
 *          description: The role of the user
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the user was created
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date and time when the user was updated
 *        nodes:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id: 
 *                type: string
 *                description: The id of the node
 *              name: 
 *                type: string  
 *                description: The name of the node
 *              sensors:
 *                type: array
 *                items:
 *                  type: object 
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: The id of the sensor
 *      example:
 *        _id: 61db294a76c09052c6dda367
 *        name: Nombre Apellido
 *        email: the@email.com
 *        enabled: user
 *        role: user
 *        createdAt: 2022-01-09T18:28:50.218Z
 *        updatedAt: 2022-01-09T18:28:50.218Z
 *        nodes: [{id: "1", name: "nodo1", sensors: [{id: "1", name: "sensor1"}, {id: "2", name: "sensor2"}]}]
 *
 *  parameters:
 *    UserId:
 *      in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *      description: The user id
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
 *  name: Users
 *  description: Users endpoint
 */


/**
 * @swagger
 * /users:
 *  get:
 *    summary: Get all users
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: An array of users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *      401:
 *        description: Unauthorized
 *     
 * 
 * 
 */
router.get('/',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('admin'),
  async (req, res, next) => {
    try {
      const users = await service.find();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *  get:
 *    summary: Get a user by id
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/UserId'
 *    responses:
 *      200:
 *        description: A user with your information, nodes and sensors
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDetails'
 *      404:
 *        description: User not found
 * 
 */

router.get('/:id',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('admin','user'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    //console.log(req.headers.authorization); //'Bearer ' + token;
    try {
      const { id } = req.params;
      const user = await service.findById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users:
 *  post:
 *    summary: Create a new user
 *    tags: [Users]
 *    requestBody:
 *      description: User object, required fields are name, email, password and role. Only admin can create users.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: The user has been created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: The user has not been created
 */

router.post('/',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('admin'),
  validatorHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUser = await service.create(body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *  patch:
 *    summary: Update a user
 *    tags: [Users]
 *    parameters:
 *      - $ref: '#/components/parameters/UserId'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: The user has been updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: The user has not been updated
 * 
 */

router.patch('/:id',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('admin'),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user = await service.update(id, body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *    summary: Delete a user
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - $ref: '#/components/parameters/UserId'
 *    responses:
 *      200:
 *        description: The user has been deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                  description: The user id
 *              example:
 *                _id: 61e47b1ecd3c0e7ab5509b37
 * 
 *              
 *      404:
 *        description: User not found
 * 
 */

router.delete('/:id',
  passport.authenticate('jwt', { session: false }), 
  checkRoles('admin'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(200).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
