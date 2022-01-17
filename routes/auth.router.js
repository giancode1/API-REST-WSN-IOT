//capa de login
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

const router = express.Router();

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
