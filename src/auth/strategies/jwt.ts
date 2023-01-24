import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from '../../config';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

export const JwtStrategy = new Strategy(options, (payload, done) => {
  done(null, payload);
});
