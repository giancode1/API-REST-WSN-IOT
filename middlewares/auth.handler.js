const boom = require('@hapi/boom');

//closure, funcion que retorna otra función
checkRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    roles.includes(user.role) ? next() : next(boom.unauthorized());
  }
}

module.exports = { checkRoles }
