import { Strategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import { config } from '../../config';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

const verify: VerifyCallback = (payload, done) => {
  done(null, payload);
};

export const JwtStrategy = new Strategy(options, verify);
