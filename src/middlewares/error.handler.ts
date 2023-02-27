import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { config } from '../config';

export function logErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (config.env === 'dev') {
    logger.warn(err.message);
  }
  next(err);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(500).json({
    message: err.message,
  });
  // next(err);
}

export function boomErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}
