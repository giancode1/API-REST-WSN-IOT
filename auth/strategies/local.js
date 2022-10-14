const { Strategy } = require("passport-local");
const boom = require('@hapi/boom');
const brcypt = require('bcrypt');
const UserService = require('../../services/user.service');

const service = new UserService();


const LocalStrategy = new Strategy({   //personalizo estas opciones, para no atarme a username
  usernameField: 'email',
  passwordField: 'password',
  },
  async (email, password, done) =>{
    try {
      const user = await service.findByEmail(email);
      if(!user){
        done(boom.unauthorized(), false);
      }
      const isMatch = await brcypt.compare(password, user.password);
      if(!isMatch){
        done(boom.unauthorized('invalid email or password'), false);
      }
      user.password = undefined;
      done(null, user);  //null: no hay error
    } catch (error) {
      done(error, false);
    }
});

module.exports = LocalStrategy;
