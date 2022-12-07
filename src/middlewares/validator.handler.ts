import boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

type Property = 'body' | 'params' | 'query';

// validatorHandler retorna una función
export function validatorHandler(schema: ObjectSchema, property: Property) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[property];
    // req.body   //si es un post la inf vienen en body
    // req.params //si es un get
    // req.query  //en la query
    // req[property] : de forma dinamica
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(boom.badRequest(`${error.message}`)); // envia a los middlewares de tipo error
    }
    next(); // si no hay error siga
  };
}
