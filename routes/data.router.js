const express = require('express');
const DataService = require('./../services/data.service');

const passport = require('passport');
const { checkRoles } = require('./../middlewares/auth.handler');

const router = express.Router();
const service = new DataService();

/**
 * @swagger
 * tags:
 *  name: Data
 *  description: Data endpoint
 */

/**
 * @swagger
 * /data/{id}:
 *  delete:
 *    summary: Delete a data
 *    tags: [Data]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          required: true
 *          description: The id of the data to delete
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
 *                  description: The data id
 *              example:
 *                _id: 61e47b1ecd3c0e7ab5509b37
 *      404:
 *        description: Data not found
 * 
 */

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin'),

  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.deleteDataById(id);
      res.status(200).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
