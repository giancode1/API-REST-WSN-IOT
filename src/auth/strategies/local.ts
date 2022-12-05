import { Strategy } from 'passport-local';
import boom from '@hapi/boom';
import brcypt from 'bcrypt';
import UserService from '../../services/user.service';

const service = new UserService();

// aqui toda mi logica de negocio
// para mi el username es el email
export const LocalStrategy = new Strategy(
  {
    // personalizo estas opciones, para no atarme a username
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user: any = await service.findByEmail(email);
      if (!user) {
        done(boom.unauthorized(), false);
      }
      const isMatch = await brcypt.compare(password, user.password);
      if (!isMatch) {
        done(boom.unauthorized('invalid email or password'), false);
      }

      // delete user.password
      const { password: pass, ...userWithoutPass } = user._doc;

      done(null, userWithoutPass); // null: no hay error
    } catch (error) {
      done(error, false);
    }
  }
);
