//capa de login
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Login
 *  description: Login endpoint
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *    summary: Login
 *    tags: [Login]
 *    description: user login
 *    requestBody:
 *      description: User object, email, password are required
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *                format: password          
 *    responses:
 *      200:
 *        description: User object with token, this token is valid for 7 days and can be used to authenticate other requests
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      description: User id
 *                    name:
 *                      type: string
 *                      description: User name
 *                    email:
 *                      type: string
 *                      description: User email
 *                    role: 
 *                      type: string
 *                      description: User role
 *                    createdAt:
 *                      type: string
 *                      description: User created date
 *                    updatedAt:
 *                      type: string
 *                      description: User updated date
 *                token:
 *                  type: string
 *                  description: JWT token
 * 
 *      401:
 *        description: Unauthorized
 *
 */

router.post('/login',
  passport.authenticate('local', { session: false }), //estrategia es local, no quiero manejar sesiones
  async (req, res, next) => {
    try {
      const user = req.user;
      const payload = {
        role: user.role,
        sub: user._id
      }
      const token = jwt.sign(payload, config.jwtSecret, {expiresIn: '7d'});
      res.json({
        user,
        token
      });
    } catch (error) {
      next(error);
    }
});

module.exports = router;
