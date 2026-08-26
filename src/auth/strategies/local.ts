import { Strategy } from 'passport-local';
import boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import UserService from '../../services/user.service';

const service = new UserService();

// personalizo estas opciones, para no atarme a username
export const LocalStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user: any = await service.findByEmail(email);
      if (!user) {
        return done(boom.unauthorized(), false);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(boom.unauthorized('invalid email or password'), false);
      }

      const { password: _pass, ...userWithoutPass } = user.toObject();

      return done(null, userWithoutPass); // null: no hay error
    } catch (error) {
      return done(error, false);
    }
  }
);
