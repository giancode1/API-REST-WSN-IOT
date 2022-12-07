import boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

type Property = 'body' | 'params' | 'query';

export function validatorHandler(schema: ObjectSchema, property: Property) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(boom.badRequest(`${error.message}`));
    }
    next();
  };
}
