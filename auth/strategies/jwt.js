const { Strategy, ExtractJwt } = require("passport-jwt");
const { config } = require('../../config/config');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //va a sacar el token de la cabecera
  secretOrKey: config.jwtSecret
}

const JwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});

module.exports = JwtStrategy;

