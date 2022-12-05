import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from '../../config/config';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // va a sacar el token de la cabecera
  secretOrKey: config.jwtSecret,
};

export const JwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});
