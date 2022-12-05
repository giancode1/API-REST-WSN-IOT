import passport from 'passport';
import { LocalStrategy } from './strategies/local'; // (logica de negocio)
import { JwtStrategy } from './strategies/jwt';

passport.use(LocalStrategy);
passport.use(JwtStrategy);
