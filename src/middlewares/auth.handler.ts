import boom from '@hapi/boom';
import { Response, NextFunction } from 'express';
import { IUser } from '../libs/models/user.model';

// closure, funcion que retorna otra función
export const checkRoles = (...roles: Array<IUser['role']>) => {
  return (req: any, res: Response, next: NextFunction) => {
    const user = req.user; // array de roles
    if (roles.includes(user.role)) {
      next();
    } else {
      next(boom.unauthorized());
    }
  };
};
