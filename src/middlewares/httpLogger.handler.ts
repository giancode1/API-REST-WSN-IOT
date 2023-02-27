import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'e2e' && process.env.NODE_ENV !== 'test') {
    morgan(
      ':method :url | Content-length: :res[content-length] | Response-time: :response-time ms'
    )(req, res, next);
  } else {
    next();
  }
}
